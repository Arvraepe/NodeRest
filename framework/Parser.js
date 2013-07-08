var _ = require("underscore");

function parseAcceptHeader (header){
    console.log(header);
    if(header){
        var retObject = {};
        var available = header.split(",");
        _.each(available, function(option){
            var parameters = option.split(";");
            var paramValues = {};
            _.each(parameters.slice(1, parameters.length), function(param){
                var kv = param.split("=");
                paramValues[kv[0]] = kv[1];
            });
            retObject[parameters[0]] = paramValues;
        });
    }
    return retObject;
}

function parsePath (route){
    return _.reject(route.split("/"), function(part){ return part === '' });
}

function parseQueryString(query){
    if(query){
        var parsedParamsObject = {};
        _.each(query.split("&"), function(param){
            var kv = param.split("=");
            parsedParamsObject[kv[0]] = kv[1] || "true";
        });

        return parsedParamsObject;
    }

    return {};
}

function parseUrl(url){
    var pieces = url.split("?");

    return {
        path: parsePath(pieces[0]),
        query: parseQueryString(pieces[1])
    };
}

exports.parseUrl = parseUrl;
exports.parseQueryString = parseQueryString;
exports.parsePath = parsePath;
exports.parseAcceptHeader = parseAcceptHeader;
