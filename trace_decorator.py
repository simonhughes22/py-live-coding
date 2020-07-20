import inspect
import random

from code_tracer import CodeTracer

def separate_preamble_and_remove_indent(source):
    lines = source.split("\n")

    # remove any lines before the first def statement, i.e. start of the functio definition
    # these will be decorators or comments
    def_index = -1
    for i, line in enumerate(lines):
        # skip document headers
        if line.strip().startswith("#") or line.strip().startswith("\""):
            continue
        if "def " in line:
            def_index = i
            break

    assert def_index >= 0, "No def statement found. This code is designed only for use with function definitions"
    # drop all lines before the def statemenbt
    preamble_lines = lines[:def_index]

    lines = lines[def_index:]
    # get def statment line
    def_line = lines[0]
    # get indent length of def statement
    indent_ix = def_line.find("def ")
    if indent_ix > -1:
        # remove indent from all remaining source lines
        lines = [l[indent_ix:] for l in lines]
        # pre-pend 4 spaces as the report builder does this also
        preamble_lines = ["    " + l[indent_ix:] for l in preamble_lines]

    return "\n".join(preamble_lines), "\n".join(lines).strip()

def append_fn_call(source, fn):
    var_name = f"_live_py_var_{random.randint(0, 999999999)}"
    return f"{source}\n{var_name}={fn.__name__}(*args, **kwargs)", var_name

def remove_fn_call(trace):
    trace_lines = trace.split('\n')
    if len(trace_lines) > 1:
        trace_lines = trace_lines[:-1]
    return "\n".join(trace_lines)

def trace(fn):

    source = inspect.getsource(fn)
    preamble, source = separate_preamble_and_remove_indent(source)
    dump = True
    max_width = 2000

    def wrapper(*args, **kwargs):
        # create a global variable to store the result within. Make sure it is unlikely to already exist
        exec_code, var_name = append_fn_call(source, fn)

        tracer = CodeTracer()
        tracer.max_width = max_width

        local_context_copy = dict(locals())
        trace = tracer.trace_code(exec_code, global_context=fn.__globals__, local_context=local_context_copy, dump=dump)
        trace = remove_fn_call(trace)
        # add back in the preamble if dumping code also
        if dump:
            trace = preamble + "\n" + trace

        print("*** Trace Output *** ".ljust(80,"-"))
        print(trace)
        print("*** END Trace Output *** ".ljust(80,"-"))

        # get return val
        ret_val = None
        if var_name in local_context_copy:
            ret_val = local_context_copy[var_name]
        return ret_val
    return wrapper

