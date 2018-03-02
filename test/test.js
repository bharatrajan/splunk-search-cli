var assert = require('chai').assert;
var GSS = require('../splunkUtils/getSplunkService.js');
var _utils = require("../utils/utils.js");
var _sanitizer = require("../utils/sanitizeOptions");
var _rp = require("../utils/resultParser")

beforeEach(function() {
    global.logger = {};
    global.logger.info = function(){};
    global.logger.error = function(){};
    global.logger.warn = function(){};
    global.logger.debug = function(){};
});


describe('Splunk CLI', function() {
  describe('Setup for Mocha', function() {
    it('Tests the setup is right', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });

  describe('splunkUtils', function() {
    it('Tests getSplunkService', function() {
        var service = GSS({
            "debug": true,
            "username": "admin",
            "password": "P@ssw0rd",
            "host": "localhost",
            "port": 8089,
            "query": true
          })
          assert.isNotNull(service)  
    });
  });  

  describe('Utils', function() {
    it('Tests spinner creation', function() {
          var splinner = _utils.showSpinner("Loading")  
          assert.isNotNull(splinner)  
    });

    it('Tests spinner text', function() {
        var splinner = _utils.showSpinner("Loading")  
        assert.equal(splinner.text, "Loading%s")  
    });

    it('Tests getJSON2CSVOptions', function() {
    
        var opt = _utils.getJSON2CSVOptions([], true)  
        assert.deepEqual(opt, {
            delimiter: {
              wrap: '"', // Double Quote (") character
              field: ",", // Comma field delimiter
              array: ";", // Semicolon array value delimiter
              eol: "\n" // Newline delimiter
            },
            prependHeader: true,
            sortHeader: false,
            trimHeaderValues: true,
            trimFieldValues: true,
            keys: []
          })  
    });

    it('Tests getCSVFileName', function() {
        var filename = _utils.getCSVFileName();
        assert.include(filename, './results-csv/')  
        assert.include(filename, '.csv')  
    });

    it('Tests getLogFileName', function() {
        var filename = _utils.getLogFileName();
        assert.include(filename, './debug-logs/')  
        assert.include(filename, '.log')  
    });   
    
    it('Tests setLogger info', function() {
        _utils.setLogger();
        //assert.isTrue(global.logger.readable)  
        assert.equal(global.logger.level, 'info')  
    });   

    it('Tests setLogger debug', function() {
        _utils.setLogger(true);
        //assert.isTrue(global.logger.readable)  
        assert.equal(global.logger.level, 'debug')  
    });  

  });  

  describe('sanitizeOptions', function() {
    it('Tests sanitizeOptions jobs true', function() {
        var result = _sanitizer.jobs({
            "debug": true,
            "username": "admin",
            "password": "P@ssw0rd",
            "host": "localhost",
            "port": 8089,
            "query": "search * | head 20"
          })
          assert.isTrue(result)  
    });

    it('Tests sanitizeOptions jobs false', function() {
        var result = _sanitizer.jobs({
            "debug": true,
            "password": "P@ssw0rd",
            "host": "localhost",
            "port": 8089,
            "query": "search * | head 20"
          })
          assert.isFalse(result)  
    });    

    it('Tests sanitizeOptions query true', function() {
        var result = _sanitizer.jobs({
            "debug": true,
            "username": "admin",
            "password": "P@ssw0rd",
            "host": "localhost",
            "port": 8089,
            "query": "search * | head 20"
          })
          assert.isTrue(result)  
    });

  }); 


  describe('Result parser', function() {
    it('Tests fieldsAns', function() {
        var fieldsAns = _rp.getFields({
            fields : [{name:"_raw"}, {name:"a"}, {name:"b"}, {name:"c"}]
         })
        assert.deepEqual(["c","a", "b","_raw"], fieldsAns)  
    });

    it('Tests fieldsAns remove _si', function() {
        var fieldsAns = _rp.getFields({
            fields : [{name:"_raw"}, {name:"a"}, {name:"_si"}, {name:"c"}]
         })
        assert.deepEqual(["c","a","_raw"], fieldsAns)  
    });    

    it('Tests getData', function() {
        var results = _rp.getData({
            results : [{name:"_raw"}, {name:"a"}, {name:"b"}, {name:"c"}]
         })
        assert.deepEqual([{name:"_raw"}, {name:"a"}, {name:"b"}, {name:"c"}], results)  
    }); 
  });   

});