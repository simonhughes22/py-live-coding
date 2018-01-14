
function onJsEditLoad() {


    var masterViewModel = {
        tabs: ko.observable("trace")
    }

    masterViewModel.fileLoader = new FileLoader(
			function (fName) {
			    $("#radiobuttons").buttonset();
			    $("#lblHtml").text(fName);
			    $("#rdo-html").click();
			},
			function (contents) {
			    htmlFileTransform(contents, document.getElementById('preview'));
			}
	);

    ko.applyBindings(masterViewModel);
    var synchScroll = function () {
        var scrollInfo = cmEditor.getScrollInfo();
        traceEditor.scrollTo(scrollInfo.x, scrollInfo.y);
    }

    // Tab Clicks
    $("#rdo-html").click(function () {
        masterViewModel.tabs("html");
    });

    $("#rdo-trace").click(function () {
        masterViewModel.tabs("trace");
        synchScroll();
    });

    $("#traceTabBtn").buttonset();

    // Load Files
    $(".link").click(function () {
        $("#files").click();
    });


    // CODE MIRROR
    CodeMirror.commands.autocomplete = function (cm) {
        CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
    };

    var cmEditor = CodeMirror.fromTextArea($("#code").get(0), {
        mode: "javascript",
        lineNumbers: true,
        lineWrapping: true,
        theme: "rubyBlue",
        extraKeys: { "Ctrl-Space": "autocomplete" },
        //tabMode: "indent",
        smartIndent: false,
        //indentUnit: 2,
        autoClearEmptyLines: true,
        matchBrackets: true,

        onChange: function () {
            jsUpdater.onchange();
        },
        onScroll: function () {
            synchScroll();
        },
        onCursorActivity: function () {
            cmEditor.matchHighlight("CodeMirror-matchhighlight");
        }
    });

    traceEditor = CodeMirror.fromTextArea($("#txtTrace").get(0), {
        mode: "javascript",
        lineWrapping: true,
        theme: "rubyBlue",
        indentUnit: 2,
        autoClearEmptyLines: true,
        readOnly: "nocursor",
        onChange: function () {
            synchScroll();
        }
    });



    var parser = new JavaScriptParser();
    var errorHandler = new ErrorHandler(cmEditor);
    var visitor = new Visitor();
    var tracer = new JsTracer(traceEditor);
    var settings = new Settings();

    window.getShared = function () {
        return {
            tracer: tracer
        }
    }

    var previewFrame = $('#preview').get(0);
    var previewDoc = previewFrame.contentWindow.document;

    htmlFileTransform("<html><head></head><body></body></html>", previewFrame);

    var jsUpdater = new Updater(
		parser,
		errorHandler,
		previewDoc,
		function () {
		    return cmEditor.getValue();
		},
		"script",
		250,
        visitor,
        tracer,
        settings);

    cmEditor.setValue(settings.getCode());
    cmEditor.focus();
    jsUpdater.onchange(true);

    // Window message handlers
    window.onerror = function (ex) {
        alert("Error from main window");
    }

    window.alertFromChild = function (msg) {
        alert(msg);
    };

    window.promptFromChild = function (msg, defltTxt) {
        return prompt(msg, defltTxt);
    };

    window.confirmFromChild = function (msg) {
        return confirm(msg);
    };
}