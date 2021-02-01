#!/usr/bin/env node
/**
 * @file
 *
 * Fetch library info using openAgency webservice findLibrary endpoint and produce a shell script to load them into smaug
 *
 * run something like: ./createSmaugClients.js -w http://openagency.addi.dk/2.34 -s https://auth-admin-stg.dbc.dk -p admin:password
 *
 */

const fs = require('fs');
const pth = require('path');
const request = require('request');
const stdio = require('stdio');
const os = require('os');

const option = getOptions();

// const outfile = fs.openSync(option.output, 'w');
// const clients = fs.readFile( __dirname + '/../../../indata/smaug/smaug-clients.json', function (err, data) {
//   if (err) {
//     throw err;
//   }
//   // data.forEach(x => {
//   //   console.log(x.toString());
//   // });
//
//   // console.log(data.toString());
// });
console.log("#!/usr/bin/env bash");
let data = JSON.parse(fs.readFileSync(pth.join(__dirname,'/../../../indata/smaug/smaug-clients.json')));
data.forEach(x => {
  let curlLine;
  const covBib = {config:{}};
  const covSkole = {config:{}};
  // if (x.config.agencyId && x.config.agencyId.match(/7[0-9]{5}/)) {
  if (x.name === "DDB Erik Bachmann") {
    console.log("echo " + x.config.agencyId + " - " + x.name);
    covBib.name = "Coverservice - " + x.name;
    covSkole.name = "Coverservice skoler - " + x.name;
    covBib.config.agencyId = x.config.agencyId;
    covSkole.config.agencyId = x.config.agencyId;
    covBib.contact = x.contact;
    covSkole.contact = x.contact;
    curlLine = "curl -X PUT -H \"Content-Type: application/json\" --user " + option.smaugUserPwd + " " +
      option.smaugAdminUrl + "/clients -d '" + JSON.stringify(covBib) + "}'";
    console.log(curlLine);
    curlLine = "curl -X PUT -H \"Content-Type: application/json\" --user " + option.smaugUserPwd + " " +
      option.smaugAdminUrl + "/clients -d '" + JSON.stringify(covSkole) + "}'";
    console.log(curlLine);
  }
});
// console.log(data[0]);



/* ------------------------------------------------------------------------------------------------------------------------------ */

/**
 * Handles options and produce Usage:
 *
 * @returns {*}
 */
function getOptions() {
  const ops = stdio.getopt({
    smaugAdminUrl: {key: 's', args: 1, description: 'smaug admin endpoint'},
    smaugUserPwd: {key: 'p', args: 1, description: 'smaug admin user:password'},
  });
  if (ops.output) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}

