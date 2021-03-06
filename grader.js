#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development and basic DOM parsing.

References: 


    + cheerio
         - https://github.com/MatthewMueller/cheerio
	 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
	 - http://maxogen.com/scraping-with-node.html

    + commander.js
         - https://github.com/visionmedia/commander.js
	 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

    + JSON
         - http://en.wikipedia.org/wiki/JSON
	 - https://developer.mozilla.org/en-US/docs/JSON
	 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/

var request = require('request'); //Added for retrieving HTML
var fs1 = require('fs');
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "https://github.com/chintanp/bitstarter/blob/443d38878d1ab1f4734e0fd2416668d6e8055fb9/index.html"

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); //http://nodejs.org/api/process.html#process_process_exit_code
    }

    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    //console.log("Inside checkHtmlFile");
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = { };
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    //Workaround for commander.js issue. 
    //http://stackoverflow.com/a/6772648
    return fn.bind({ });
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url>', 'URL of the HTML file') //Option to accept URL on the command line
        .parse(process.argv);
    //Check to see whether the user chose file or URL
    if(program.file) {
	//This is how HTML file in directory is checked
	console.log(program.file);
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
    else if(program.url) {
	//Logic to get the HTML file from the URL and send the file for checking.  
	//rest is a restler object. The HTML file contents are available in the 'result' variable.
	rest.get(program.url).on('complete', function(result) {
	   // console.log(result);
	    fs1.writeFileSync('downloaded.html', result);
	    //console.log("Wrote into the file downloaded");
            var checkJson = checkHtmlFile('downloaded.html', program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    fs1.writeFileSync('output.json', outJson);
	 });   
				      

    }	
}
else {
    exports.checkHtmlFile = checkHtmlFile;
}

