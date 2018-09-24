String.prototype.toPlural = function () {
    return this.replace(/((?:\D|^)1 .+?)s/g, "$1");
};

String.prototype.replaceAll = function (search, replacement) {
    return this.replace(RegExp(search, "gi"), replacement);
};