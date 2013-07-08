require("./JavaScriptNatives.js");
var _ = require('underscore');
var http = require('http');
var L = require("./Logger.js");
var H = require("./Helpers.js");
var P = require("./Parser.js");

/**
 *
 *
 *  Hooks:
 *
 *
 */
var HOOKS = {
    early: [],
    parsed: [],
    handle: [],
    late: []
};

function addHook(when, func) {
    if (typeof func === "function" && HOOKS[when])
        HOOKS[when].push(func);
}

/**
 *
 *
 *  Routes:
 *
 */
var ROUTES = {
    get: {},
    post: {}
};

function addRoute(when, route, func){
    // Standard config for routes
    var config = {};

    if (typeof func === "function"
        && typeof route === "string"
        && _.contains(_.keys(ROUTES), when)
        ){
        // Register route
        ROUTES[when][route] = {
            path: P.parsePath(route),
            method: when,
            config: config,
            handler: func
        };

        return {
            config: function(uc){
                // Plug them in the routes object
                ROUTES[when][route].config = uc;
            }
        };
    } else {
        return {
            // Return function that can be called but won't do anything.
            config: function(){ /* TODO Show Error Message */ }
        };
    }
}

/**
 * Configuration
 *
 * @type {{host: string, port: string}}
 */
var CONFIG = {
    host: "localhost",
    port: "8080"
};
function configure(config){
    var uc = CONFIG;
    uc.host = config.host || uc.host;
    uc.port = config.port || uc.port;

    CONFIG = uc;
}

/**
 * Internal Request Handling
 *
 */

/**
 * Stage 1: Incoming (applying early hook)
 *
 * @param request
 * @param response
 */
function incoming(request, response){
    L.log("Incoming [{0}] at path [{1}]".format(request.method, request.url))
    // Early Hook
    _.each(HOOKS["early"], function(hook){
        hook(request, response);
    });

    parse(request, response);
}

/**
 * Stage 2: Parse
 *
 * Initializing the Environment Object
 *
 * @param request
 * @param response
 */
function parse(request, response){
    // Parse the request url to a path array and query params object
    var parsed = P.parseUrl(request.url.toLocaleLowerCase());
    // Look for the correct handler
    var handler = H.findHandler(request.method.toLowerCase(), ROUTES, parsed, request);
    console.log(P.parseAcceptHeader(request.headers["accept-language"]));

    if(handler.handler !== undefined){

        var environment = {
            path: parsed.path,
            queryParams: parsed.query,
            urlParams: handler.parameters,
            method: request.method.toLowerCase(),
            headers: request.headers,
            _handler: handler.handler,
            _rawResponse: response,
            _rawRequest: request
        };

        // Parsed Hook
        _.each(HOOKS["parsed"], function(hook){
            hook(environment);
        });

        authorize(environment);
    } else {
        response.writeHead(404, {'Content-Type': 'json'});
        response.end(JSON.stringify({status: 404, message: 'There is no functionality found at this path'}));
    }
}

/**
 * Stage 3: Authorization
 *
 * Creating a user / session / based on the authentication and the Server State
 *
 * @param environment
 */
function authorize(environment){
    // Decide, stateless or statefull
    handle(environment);
}

/**
 *
 * Stage 4: Handle
 *
 * Search for the appropriate handler in the defined routes. When a route isn't found then ... TODO
 *
 * @param environment
 */
function handle(environment){
    var handled = environment._handler["handler"](environment);
    environment._rawResponse.writeHead(200, {'Content-Type': handled.type});
    environment._rawResponse.end(JSON.stringify(handled.body));
}

/*

 Begin Interface

*/

exports.on = {
    early: function(func){ addHook("early", func); },
    parsed: function(func){ addHook("parsed", func); },
    handle: function(func){ addHook("handle", func); },
    late: function(func){ addHook("late", func); }
};

exports.route = {
    get: function(route, func) { return addRoute("get", route, func); },
    post: function(route, func) { return addRoute("post", route, func); }
};

exports.start = function(config){
    if(config) configure(config);

    L.err("Starting Server with config {0}".format(JSON.stringify(config)), "INIT","SERVER");

    http.createServer(function (req, res) {
        incoming(req, res);
    }).listen(CONFIG["port"], CONFIG["host"]);
    L.err("Service listening to {0} @ {1}".format(CONFIG["port"], CONFIG["host"]), "INIT", "SERVER")
};

