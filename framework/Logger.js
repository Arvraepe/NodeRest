require("./JavaScriptNatives.js");
var _ = require("underscore");

var modes = ["debug", "test", "production"]
var mode = modes[0];

function log(str, identifier){
    if (mode !== "production") {
        var id = "NodeRest";
        if(identifier) id = identifier;
        console.log("[{2}] {0} > {1}".format(id, str, mode));
    }
}

function err(str, level, identifier){
    var id = "NodeRest";
    if(identifier) id = identifier;
    console.log("[{2}] {0} > {1}".format(id, str, level));
}

exports.setMode = function(m){
    if(_.contains(modes, m)){
        mode = m;
    }
};

exports.log = log;
exports.err = err;