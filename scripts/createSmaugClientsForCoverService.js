#!/usr/bin/env node
/**
 * @file
 *
 * Fetch library info using smaug client endpoint and produce a shell script to load them into smaug
 *
 * run something like: ./createSmaugClientsForCoverService.js -s https://auth-admin-stg.dbc.dk/clients -p admin:password -i relative/path/to/inputfile.json
 *
 */

const fs = require('fs');
const pth = require('path');
const stdio = require('stdio');

const option = getOptions();


console.log("#!/usr/bin/env bash");
const data = JSON.parse(fs.readFileSync(pth.join(__dirname, option.inputfile)));
data.forEach(x => {
  let curlLine;
  const covBib = {config:{}};
  const covSkole = {config:{}};
  if (x.config.agencyId && x.config.agencyId.match(/7[0-9]{5}/)) {
  // if (x.name === "DDB Erik Bachmann") { //for test
    console.log("echo " + x.config.agencyId + " - " + x.name);
    covBib.name = "Coverservice - " + x.name;
    covSkole.name = "Coverservice skoler - " + x.name;
    covBib.config.agencyId = x.config.agencyId;
    covSkole.config.agencyId = x.config.agencyId;
    covBib.contact = x.contact;
    covSkole.contact = x.contact;
    curlLine = "curl -X POST -H \"Content-Type: application/json\" --user " + option.smaugUserPwd + " " +
      option.smaugAdminUrl + " -d '" + JSON.stringify(covBib) + "'";
    console.log(curlLine);
    curlLine = "curl -X POST -H \"Content-Type: application/json\" --user " + option.smaugUserPwd + " " +
      option.smaugAdminUrl + "/clients -d '" + JSON.stringify(covSkole) + "'";
    console.log(curlLine);
  }
});



/* ------------------------------------------------------------------------------------------------------------------------------ */

/**
 * Handles options and produce Usage:
 *
 * @returns {*}
 */
function getOptions() {
  const ops = stdio.getopt({
    inputfile: {key: 'i', args: 1, description: 'inputfile with smaug clients'},
    smaugAdminUrl: {key: 's', args: 1, description: 'smaug admin endpoint'},
    smaugUserPwd: {key: 'p', args: 1, description: 'smaug admin user:password'},
  });
  if (ops.output) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}

