// this purely wraps the parser to abstract away the interface (but not the AST)
function JavaScriptParser() {
    var _self = this;
    var _parser = esprima;

    _self.tryParse = function (code) {
        try
        {
            var ast = _parser.parse(code, { range: true, loc: true });
            return {
                ast: ast,
                succeeded: true
            }
        }
        catch (ex)
        {
            return {
                succeeded: false,
                exception: ex
            }
        }
    }

    return _self;
}