from trace_decorator import trace

if __name__ == '__main__':

    try:
        # Additional decorator to test
        def record_call(fn):
            def wrapper(*args, **kwargs):
                # print(f"Calling: {fn.__name__}")
                return fn(*args, **kwargs)
            return wrapper

        global_var = "Simon Says"

        @record_call
        @trace
        def a_function(a,b,c):

            i = 0
            i += 1

            s = "a"
            s += "b"
            s += "c"

            l = []
            l.append(i)
            l.append(s)
            l.append(l)

            t = global_var

            print(s + s + s)
            for i in range(4):
                i_sq_a_a_a_a = i ** 2

            return a + b + c

        val = a_function(1,2,3)

    except Exception as e:
        exc = format_exc()
        print(exc)
