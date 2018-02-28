module.exports = (function(){

    return function(splunkService){
        splunkService.login(function(err, success) {
            if (err) {
                console.log("    ❗   Error in login");
                return
            }

            splunkService.jobs().fetch(function(err, jobs) {
                var jobList = jobs.list();
                for(var i = 0; i < jobList.length; i++) {                    
                    console.log(" ✅   Job " + i + ": " + jobList[i].sid);
                }
            });
        });
    }
})();