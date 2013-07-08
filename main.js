var S = require('./framework/NodeRest.js');

S.route["get"]("/error/", function(environment){
    return {
        type: "json",
        body: { test: "myName" }
    };
});

S.route["get"]("/error/{id}/comment", function(environment){
    return {
        type: "json",
        body: { test: "myName_"+environment.urlParams["id"] }
    };
});

S.start({
    host: 'localhost',
    port: 8080
});