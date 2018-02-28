module.exports = function(options, ctx){
        let logger = ctx || console;
        let username = options.username,
            password = options.password,
            host = options.host,
            port = options.port,
            query = options.query;
        
        if(typeof username === 'undefined') logger.log("    ❗   Username is required");
        if(typeof password === 'undefined') logger.log("    ❗️   Password is required");
        if(typeof host === 'undefined') logger.log("    ❗   Host is required");
        if(typeof port === 'undefined') logger.log("    ❗   Port is required");
        if(typeof query === 'undefined') logger.log("    ❗   Query is required");

        return ( 
                (typeof username !== 'undefined')  &&
                (typeof password !== 'undefined')  &&
                (typeof host !== 'undefined')  &&
                (typeof port !== 'undefined')  &&
                (typeof query !== 'undefined')
               );
    }        