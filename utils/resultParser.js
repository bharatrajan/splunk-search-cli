let _ = require('lodash'); 

module.exports = {
    getFields: function(result){
        let fields = []
        if(!_.isEmpty(result) && 
            !_.isEmpty(result.fields) && 
                _.isArray(result.fields)){
                    result.fields.forEach(function(item){
                        if("_si" != item.name)
                            fields.push(item.name)
                    });       
                }
        return fields
    },

    getData: function(resp){
        let results = []
        if(!_.isEmpty(resp) && 
            !_.isEmpty(resp.results) && 
                _.isArray(resp.results)){
                    results = resp.results
                }
        return results
    }

}