function Updater(parser, errorHandler, document, getText, elementType, updateInterval, visitor, tracer, settings) {

    // private variables
    var _self = this;

    var _cancelToken;
    var _updateInterval = updateInterval;

    var _doc = document;
    var _elementId = "__injected__" + elementType;
    var _visitor = visitor;

    // private functions
    var _injectScript = function (code) {

        if(_doc.body){
            var element = _doc.getElementById(_elementId);
            if (element)
                _doc.body.removeChild(element);

            var element = _doc.createElement(elementType);
            element.id = _elementId;
            element.text = code;
            _doc.body.appendChild(element);
        }
    }

    var _update = function (code) {
        var start = new Date().getTime();

        window.childException = null;

        var result = parser.tryParse(code);
        var hasErrors = !result.succeeded;
        if (result.succeeded) {

            var visitResults = _visitor.visit(result.ast, code);
            // var functionsList = visitResults.functions
            var traceCode = tracer.trace(code, visitResults);

            _injectScript(
                "try{\n" +
                    traceCode +
                 "\n} \n " +
                 "catch(ex){ " +
                    "\n parent.window.childException = ex; " +
                  "\n }; ");

            if (window.childException) {
                hasErrors = true;
                errorHandler.showRunTimeError(window.childException);
            }
            else {
                settings.setCode(code);
                // Success, no parse error, no run time error
                errorHandler.clearErrors();
            }
        }
        else {
            errorHandler.showParserError(result.exception);
        }
        tracer.dump(code, hasErrors);

        delete window.childException;

        var end = new Date().getTime();
        console.log("Update Completed in: " + (end - start) + " ms");
    }

    // public functions
    _self.onchange = function (force) {
        clearTimeout(_cancelToken);
        if (force) {
            _update(getText())
        }
        else {
            _cancelToken = setTimeout(
            function () {
                _update(getText());
            },
            _updateInterval);
        }
    }

  	return _self;
};