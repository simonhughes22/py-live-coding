from code_tracer import CodeTracer

from IPython import get_ipython
from IPython.core.magic import Magics, magics_class, cell_magic

@magics_class
class TraceCellMagic(Magics):

    # override default constructor so we can pass state between magics
    def __init__(self, shell):
        # You must call the parent constructor
        super(TraceCellMagic, self).__init__(shell)

    @cell_magic
    def trace(self, line, cell):

        source = "i = 0\ni+=1\n"
        ipython = get_ipython()

        dump = True
        # Set this to None (or don't set) when logging the code rather than printing it
        max_width = 20000

        tracer = CodeTracer()
        tracer.max_width = max_width

        trace = tracer.trace_code(source, global_context=ipython.user_ns, local_context=dict(), dump=dump)
        # add back in the preamble if dumping code also

        ipython.write("*** Trace Output *** ".ljust(80,"-"))
        ipython.write(trace)
        ipython.write("*** END Trace Output *** ".ljust(80,"-"))

        return line, cell

def load_ipython_extension(ipython):
    """
    Any module file that define a function named `load_ipython_extension`
    can be loaded via `%load_ext module.path` or be configured to be
    autoloaded by IPython at startup time.
    """
    # You can register the class itself without instantiating it.  IPython will
    # call the default constructor on it.
    ipython.register_magics(TraceCellMagic)