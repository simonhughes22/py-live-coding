function JsTracer(cmEditor) {

    function createTransforms() {
        var lines = {};
        return {
            addLine: function (line, ch, text) {

                if (!lines[line]) {
                    lines[line] = {}
                }
                lines[line][ch] = text;
            },
            lines: lines
        }
    }

    function mergeVisitResults(visitResult) {
        var sorted = {};

        for (var n in visitResult) {
            if (visitResult.hasOwnProperty(n)) {
                var data = visitResult[n];
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    sorted[item.start] = item;
                }
            }
        }
        var array = [];
        for (var n in sorted) {
            if (sorted.hasOwnProperty(n)) {
                array.push(sorted[n]);
            }
        }
        return array;
    }

    function extractParams(node) {
        var parms = [];
        for (var i = 0; i < node.params.length; i++) {
            var loc = node.params[i].loc;
            var param = {
                name: node.params[i].name,
                line: loc.end.line,
                ch: loc.end.column
            };
            parms.push(param);
        }
        return parms;
    }

    function processTransforms() {

        var lines = Object.keys(_transForms.lines);
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {

            var line = lines[lineIndex];
            var lineTransforms = _transForms.lines[line];

            var offset = 0;
            var cols = Object.keys(lineTransforms);
            for (var colIndex = 0; colIndex < cols.length; colIndex++) {
                var col = cols[colIndex];
                var value = lineTransforms[col];
                var sVal = ":" + value;

                var from = {
                    line: parseInt(line) - 1,
                    ch: parseInt(col) + offset
                };

                var to = {
                    line: from.line,
                    ch: from.ch + sVal.length
                };
                _cmEditor.replaceRange(sVal, from);
                _cmEditor.markText(from, to, "traceOutput");

                offset += sVal.length;
            };
        }
    }

    var _self = this;
    var _cmEditor = cmEditor;
    var _transForms = createTransforms();

    var _traceFunction = "\nwindow.tracer.functionCalled({0}, {1}, arguments);\n";
    _self.functionCalled = function (params, name, args) {

        //TODO although defined with no params, functions can have params passed
        // handle this
        for (var i = 0; i < params.length && i < args.length; i++) {
            var param = params[i];
            var value = args[i];

            _transForms.addLine(param.line, param.ch, toDisplayString(args[i]));
        };
    }

    _self.assignment = function (positionInfo, value) {
        _transForms.addLine(positionInfo.line, positionInfo.ch, toDisplayString(value));
        return value;
    }

    function updateOffset(offsetQueue, index) {
        var offset = 0;
        var firstProperty = FirstProperty(offsetQueue);

        while (firstProperty && firstProperty <= index) {

            offset += offsetQueue[firstProperty];
            delete offsetQueue[firstProperty];

            firstProperty = FirstProperty(offsetQueue);
        }
        return offset;
    }

    // Transforms code to include trace code
    _self.trace = function (code, visitResult) {

        // reset
        _transForms = createTransforms();
        var array = mergeVisitResults(visitResult);
        var tmp = code;
        var offset = 0;

        var offsetQueue = {};

        for (var i = 0; i < array.length; i++) {
            var item = array[i];

            offset += updateOffset(offsetQueue, item.start);

            var start = item.start + offset;
            var before, after, inject;

            if (item.type == "function") {
                inject = formatString(_traceFunction, extractParams(item.node), item.name);
                start++;

                before = tmp.substring(0, start);
                after = tmp.substr(start, tmp.length);

                offset += inject.length;
            }
            else if (item.type == "assignment") {

                var end = item.end + offset;
                var expression = tmp.substring(start, end);

                inject = "window.tracer.assignment(" + JSON.stringify(item.leftLocn) + "," + expression + ")";
                before = tmp.substring(0, start);
                after = tmp.substr(end, tmp.length);

                // queue up offset addition for trailing paren
                if(!offsetQueue[item.end])
                {
                    offsetQueue[item.end] = 1;
                }
                else
                {
                    offsetQueue[item.end]++;
                }

                // the length of the additional code (-1 for trailing paren)
                offset += (inject.length - expression.length) - 1;
            }
            else {
                continue;
            }

            tmp = before + inject + after;

        };
        //console.log(tmp);
        return tmp;
    };

    _self.dump = function (code, hasErrors) {
        if (hasErrors) {
            cmEditor.setValue(code);
        }
        else {
            //TODO roll buffer all changes using operation command
            // insert trace

            cmEditor.setValue(code);
            processTransforms();
        }
        delete _transForms;
    }

    return _self;
}