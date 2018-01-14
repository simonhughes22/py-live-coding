function isArray(value){
	if(value instanceof Array)
		return true;
	return value.constructor.toString().substr(0,14) == "function Array";
}

function FirstProperty(obj) {
    var keys = Object.keys(obj);
    if (keys.length > 0) {
        return keys[0];
    }
    return null;
}

function forEachMember(obj, forEachFn) {
    for (var n in obj) {
        if (obj.hasOwnProperty(n)) {
            forEachFn(n, obj[n]);
        }
    }
}


function forEachProperty(obj, forEachFn) {
    for (var n in obj) {
        if (obj.hasOwnProperty(n)) {

            if (typeof obj[n] == "function") {
                continue;
            }
            forEachFn(n, obj[n]);
        }
    }
}

function forEachMethod(obj, forEachFn) {
    for (var n in obj) {
        if (obj.hasOwnProperty(n)) {

            if (typeof obj[n] == "function") {
                forEachFn(n, obj[n]);
            }
        }
    }
}

function toDisplayString(value) {

    if (value === undefined) {
        return "undf";
    }
    else if (value === null) {
        return "null";
    }
    else {

        var type = typeof value;
        switch (type) {
            case "object":
                if (isArray(value)) {
                    
                    return "[" + value.map(toDisplayString).join(",") + "]";
                }
                else if (value instanceof Date) {
                    return value.toShortDate();
                }

                var array = [];
                forEachMember(value, function (n, v) {
                    array.push("\"" + n + "\":" + toDisplayString(v));
                });

                return "{" + array.join(",") + "}";

            case "string":
                return "\"" + value + "\"";

            case "number":

                if (isNaN(value)) {
                    return "NaN";
                }
                // is int?
                else if (value % 1 === 0) {
                    return value.toString();
                }
                // must be a float
                else {
                    return value.toString();
                    //return value.toFixed(2).toString();
                }
                break;
            case "function":
                var ftxt = value.toString().replace("function", "");

                //var name = ftxt.substring(0, ftxt.indexOf("(")).trim();
                var name = value.name;
                if (name == "") {
                    name = "[anon]";
                }
                return name + "()";
            default:
                return value.toString();
        }
    }
}

function formatString()/*string str, params args*/{
    var str = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
        var value = arguments[i];
        var sVal = toDisplayString(value);
        str = str.replace("{" + (i - 1).toString() + "}", sVal);
    };
    return str;
}

function padNumber(num, len) {

    if (len == undefined)
        len = 2;

    return num.toString().padLeft(len, "0");
}
