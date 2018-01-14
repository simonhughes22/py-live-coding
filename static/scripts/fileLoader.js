function FileLoader(onLoad, fileTransform) {

    // private variables
    var _self = this;
    var _transform = fileTransform;
    var _onLoad = onLoad;

    // public variables

    _self.fileName = ko.observable("Html File");
    _self.fileSelected = ko.observable(false);

    // private methods
    function createFileReader(fName) {
        var reader = new FileReader();
        reader.onerror = function (er) {
            _self.fileSelected(false);
            alert("Failed to read file: " + fname + " with error: + " + er.toString());
        }

        reader.onload = function (evt) {
            var fileContents = evt.target.result;
            _transform(fileContents);
            _onLoad(_self.fileName());
            _self.fileSelected(true);
        }
        return reader;
    }

    // public methods

    _self.onFileSelect = function (data, evt) {

        var files = evt.target.files; // FileList object
        if (files.length > 1) {
            _self.fileSelected(false);
            alert("You can only select one Html file!");
            return;
        }

        var f = files[0];

        // Read in the file as text.
        createFileReader(f.name)
            .readAsText(f);

        _self.fileName(f.name);        
    }
    return _self;
}
