const QUERY_HEAD_STR = "search ";

module.exports = {
    jobs : function(options, ctx){
        let logger = ctx || console;
        let username = options.username,
            password = options.password,
            host = options.host,
            port = options.port;
        
        if(typeof username === 'undefined') logger.log("    ❗   Username is required");
        if(typeof password === 'undefined') logger.log("    ❗️   Password is required");
        if(typeof host === 'undefined') logger.log("    ❗   Host is required");
        if(typeof port === 'undefined') logger.log("    ❗   Port is required");

        if(global.debug){
            logger.log(" ✅   username : ", username);
            logger.log(" ✅   password : ", password);
            logger.log(" ✅   host : ", host);
            logger.log(" ✅   port : ", port);
        }


        return ( 
                (typeof username !== 'undefined')  &&
                (typeof password !== 'undefined')  &&
                (typeof host !== 'undefined')  &&
                (typeof port !== 'undefined')
                );
    },

    query: function(options, ctx){
        let logger = ctx || console,
            query = options.query,
            isQueryEmpty = (typeof query === 'undefined');
          
        if(isQueryEmpty) logger.log("    ❗   Query is required");

        if(global.debug){
            logger.log(" ✅   query : ", encodeURIComponent(query));
        }

        if(!isQueryEmpty && query.indexOf(QUERY_HEAD_STR) != 0)
            query = QUERY_HEAD_STR + query;

        return( 
            this.jobs(options, ctx)  &&
            !isQueryEmpty 
        );

    }
}