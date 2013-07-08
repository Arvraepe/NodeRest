var _ = require("underscore");

var UrlParamRegex = /^\{(.*)\}$/;
function isMatch(candidate, route, accepts){
    var match = true;
    var parameters = {};
    _.each(candidate.path, function(cPiece, index){
        // we can assume that they have the same length. (previous check)
        var pPiece = route[index];

        // Check the content of the URL
        if(UrlParamRegex.test(cPiece)) parameters[UrlParamRegex.exec(cPiece)[1]] = pPiece;
        else if(pPiece !== cPiece) match = false;

        // Check the config stuff
        if(candidate.config.accepts) {
            // Check the accept
        }
    });

    return {
       match: match,
       parameters: parameters
    };
}

exports.findHandler = function(method, routes, path, _rawRequest){
    if (routes[method]){
        var candidates = _.reject(routes[method], function(r){
            return r.path.length !== path.path.length;
        });

        if(candidates.length > 0){
            var match = { };
            _.each(candidates, function(candidate){
                var matched = isMatch(candidate, path.path, _rawRequest.headers["accept"]);
                if(matched.match === true) match = {
                    handler : candidate,
                    parameters : matched.parameters
                }
            });
            return match;
        }
    }

    // Return default object without handler, and without url params
    return { }
};
