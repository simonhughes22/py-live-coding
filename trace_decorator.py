from traceback import format_exc
from code_tracer import CodeTracer
import random
import inspect

def remove_decorator_and_indent(source):
    source = source.strip()
    lines = [l for l in source.split("\n") if '@trace' not in l]

    def_line = [l for l in lines if "def " in l][0]
    indent = def_line.find("def ")
    if indent > -1:
        lines = [l[indent:] for l in lines]
    return "\n".join(lines)

def add_fn_call(source, fn):
    var_name = f"live_py_var_{random.randint(0, 999999999)}"
    return f"{source}\n{var_name}={fn.__name__}(*args, **kwargs)", var_name

def remove_fn_call(trace):
    trace_lines = trace.split('\n')
    if len(trace_lines) > 1:
        trace_lines = trace_lines[:-1]
    return "\n".join(trace_lines)

def trace(fn):

    source = inspect.getsource(fn)
    source = remove_decorator_and_indent(source)

    def wrapper(*args, **kwargs):
        # create a global variable to store the result within. Make sure it is unlikely to already exist
        exec_code, var_name = add_fn_call(source, fn)

        tracer = CodeTracer()
        tracer.max_width = 200000

        trace = tracer.trace_code(exec_code, global_context=globals(), local_context=locals(), dump=True)
        trace = remove_fn_call(trace)

        print(trace)
        # get return val
        ret_val = locals()[var_name]
        return ret_val

    return wrapper

if __name__ == '__main__':

    try:

        @trace
        def add(a, b):
            s1 = "aaa"
            s2 = "bbb"
            s3 = s1 + "," + s2
            return a + b

        val = add(10,12)

    except Exception as e:
        exc = format_exc()
        print(exc)

