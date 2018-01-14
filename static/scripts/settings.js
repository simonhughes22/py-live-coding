function Settings() {
    var self = this;

    var loadSetting = function (setting) {
        var value = localStorage[setting];
        if (value === undefined) {
            localStorage[setting] = "";
        }
        return localStorage[setting];
    }
    var setSetting = function (setting, value) {
        localStorage[setting] = value;
    };

    var codeKey = "jsEditCode";

    self.getCode = function () {
        return loadSetting(codeKey);
    };

    self.setCode = function (value) {
        setSetting(codeKey, value)
    };

}