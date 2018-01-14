function ErrorHandler(codeMirrorEditor) {

    // private variables
    var _self = this;
    var _cm = codeMirrorEditor;

    var _marker = undefined;
    var _errorLine = -1;
    var _currentEx = undefined;

    // private function
    var _locn = function (line, ch) {
        return {
            line: line,
            ch: ch
        }
    }

    var _sameError = function (ex) {
        if (!_currentEx) {
            return false;
        }
        return (ex.name == _currentEx.name && ex.message == _currentEx.message);
    }

    // public functions
    _self.showParserError = function (ex) {

        _currentEx = ex;
        var line = ex.lineNumber - 1;

        var lineTxt = _cm.getLine(line);
        var col = ex.column;

        var offendingToken = _cm.getTokenAt(_locn(line, col));

        _self.clearErrors();

        _marker = _cm.markText(
            _locn(line, offendingToken.start),
            _locn(line, offendingToken.end),
            "jsError");

        _errorLine = line;
        
        _cm.setMarker(line, "<span class='error' title='" + ex.message + "'>%N%</span>");
    }

    _self.showRunTimeError = function (ex) {
        // TODO don't highlight line, show stack trace in output window
        
        if (_sameError(ex)) {
            _currentEx = ex;
            return;
        }

        _self.clearErrors();
        _currentEx = ex;
        _errorLine = _cm.getCursor().line;

        var msg = ex.message;
        if (!msg)
            msg = ex.toString();

        _cm.setMarker(_errorLine, "<span class='error' title='" + msg + "'>%N%</span>");
    };

    _self.clearErrors = function () {
        if (_marker) {

            if (_marker.find().from) {
                //_cm.clearMarker(_marker.find().from.line);

                // CLEARS UNDERLINE
                _marker.clear();
            }
            _cm.clearMarker(_errorLine);
        }

        var gutterItems = $(".CodeMirror-gutter-text pre");
        if ($(gutterItems).find(".error").length > 0) {
            var i = 0;
            $(gutterItems).each(function () {

                var match = ($(this).find(".error").length > 0);
                if (match) {
                    _cm.clearMarker(i);
                }
                i++;
            });        
        }
        _currentEx = undefined;
        _marker = undefined;
        _errorLine = -1;
    };

    return _self;
}