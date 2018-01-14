/* Console */
if (!console) {
    console = {};
}

if ((typeof console.log != 'function')) {
    console.log = function () { };
}

/* Object */
if (typeof Object.keys != 'function') {
    Object.keys = function (obj) {
        if ((typeof obj != "object" && typeof obj != "function") || obj == null) {
            throw TypeError("Object.keys called on non-object");
        }
        var keys = [];
        for (var p in obj) obj.hasOwnProperty(p) && keys.push(p);
        return keys;
    }
}

/* String Extensions */
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}

String.prototype.padLeft = function (len, chr) {
    var copy = this;
    while (str.length < len) {
        copy = chr + copy;
    }
    return copy;
}

/* Date */
Date.prototype.toShortDate = function () {

    var dt = this;

    var day = dt.getDate();
    var month = dt.getMonth();
    month++;
    var year = dt.getFullYear();
    if (year >= 2000)
        year -= 2000;
    else if (year >= 1900)
        year -= 1900;

    return padNumber(month) + "/" + padNumber(day) + "/" + padNumber(year);
}