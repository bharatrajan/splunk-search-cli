let Spinner = require('cli-spinner').Spinner;

module.exports = {
    showSpinner : function(str){
        let spinner = new Spinner(str + '%s');
            spinner.setSpinnerString('|/-\\');    
        return spinner;
    }
}