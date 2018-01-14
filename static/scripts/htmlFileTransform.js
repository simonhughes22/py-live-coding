function htmlFileTransform(contents, iFrame) {

    
    var getShared = " var shared = parent.window.getShared();";
    var setTracer = " window.tracer = shared.tracer;";

    var redefAlert   = " window.alert = function(msg){ parent.window.alertFromChild(msg); }; ";
    var redefPrompt  = " window.prompt = function(msg, defltTxt){ return parent.window.promptFromChild(msg, defltTxt); }; ";
    var redefConfirm = " window.confirm = function(msg)         { return parent.window.confirmFromChild(msg); };  ";

    var rededOnError = " window.onerror = function(ex) { parent.window.childException = ex; }; ";
    var redirect     = getShared + setTracer + redefAlert + redefPrompt + redefConfirm + rededOnError;

    var src = "<script\>" + redirect + "</script\>";

    // Import Jquery
    var imports = "<script type='text/javascript' src='tools/jquery-ui-1.8.21.custom/js/jquery-1.7.2.min.js'></script>";

    var result = contents.replace("</body>", src + "</body>");
    result =  result.replace("<head>", "<head>" + imports);

    var doc = iFrame.contentDocument || iFrame.contentWindow.document;

    doc.open();
    doc.write(result);
    doc.close();
}