import sys
from traceback import format_exc

from flask import Flask, jsonify, request
from code_tracer import CodeTracer

app = Flask(__name__)

@app.route('/parsecode', methods=["POST"])
def parsecode():
    try:
        code = request.form["code"]
        if not code or len(code.strip()) == 0:
            return jsonify({"error": "code is null or empty"})

        tracer = CodeTracer()
        tracer.max_width = 200000
        code_report = tracer.trace_code(code, dump=False)

        return jsonify({"code_report": code_report})

    except Exception as e:

        exc = format_exc()
        print(exc)
        return (jsonify({
            "error": "an exception occurred: {exc}".format(exc=exc)
        }), 500)

if __name__ == '__main__':
    if len(sys.argv) != 1:
        raise Exception("Incorrect number of command line arguments - {0}.".format(len(sys.argv)))

    # note - host= '0.0.0.0' will expose externally on host's ip
    app.run(port=5000)