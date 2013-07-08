String.prototype.oldFormat = String.prototype.format;
String.prototype.format = function () {
    var str = this;

    for (var i = arguments.length - 1; i >= 0; i -= 1) {
        if(typeof arguments[i] === "string")
            str = str.replace(new RegExp("\\{" + i + "\\}", "gm"), arguments[i]);
    }

    return str;
}
