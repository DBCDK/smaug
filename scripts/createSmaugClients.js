#!/usr/bin/env node
/**
 * @file
 *
 * Fetch library info using openAgency webservice findLibrary endpoint and produce a sheel script to load them into smaug
 *
 * run something like: ./createSmaugClients.js -w http://openagency.addi.dk/2.34 -s https://auth-admin-stg.dbc.dk -p admin:password -o loadSmaug.sh
 *
 */

const fs = require('fs');
const request = require('request');
const stdio = require('stdio');
const os = require('os');

const option = getOptions();

const outfile = fs.openSync(option.output, 'w');
request(
  {
    uri: option.openAgency,
    qs: {action: 'findLibrary', pickupAllowed: '1', outputType: 'json', libraryType: 'Folkebibliotek'}
  },
  function (error, response) {
    if (response.statusCode !== 200) {
      console.log('error status', response.statusCode);
      console.log('error', error);
      process.exit(1);
    }

    const body = JSON.parse(response.body);
    if (!body.findLibraryResponse.pickupAgency) {
      console.log('No libraries found - perhaps a hickup?');
      process.exit(1);
    }

    body.findLibraryResponse.pickupAgency.forEach(agency => {
      // if (agency.branchType.$ === 'H' && agency.branchId.$ === '710100') {
      if (agency.branchType.$ === 'H') {
        const email = agency['agencyEmail'] ? agency.agencyEmail.$ : '';
        const concact = agency['headOfInstitutionName'] ? agency.headOfInstitutionName.$ : email;
        const phone = agency['agencyPhone'] ? agency.agencyPhone.$ : '';
        const item = {"name": agency.agencyName.$,
                      "config": '',
                      "contact": {"owner": {"name": concact, "email": email, "phone": phone}}
                     };
        const bibLine = '#\necho -n "' + agency.agencyId.$ +  ' ' + item.name + ' "';
        const curlLine = 'curl -X POST -H "Content-Type: application/json" --user ' + option.smaugUserPwd + ' ' + option.smaugAdmin + '/clients -d \'' + JSON.stringify(item) + '\'';
        fs.writeSync(outfile, bibLine + os.EOL, null, 'utf8');
        fs.writeSync(outfile, curlLine + os.EOL, null, 'utf8');
        fs.writeSync(outfile, 'echo ' + os.EOL);
        fs.writeSync(outfile, 'echo ' + os.EOL);
      }
    });

    fs.closeSync(outfile);
  }
);

/* ------------------------------------------------------------------------------------------------------------------------------ */

/**
 * Handles options and produce Usage:
 *
 * @returns {*}
 */
function getOptions() {
  const ops = stdio.getopt({
    openAgency: {key: 'w', args: 1, description: 'openAgency endpoint'},
    smaugAdmin: {key: 's', args: 1, description: 'smaug admin endpoint'},
    smaugUserPwd: {key: 'p', args: 1, description: 'smaug admin user:password'},
    output: {key: 'o', args: 1, description: 'Output file'}
  });
  if (!ops.openAgency || !ops.output) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}

