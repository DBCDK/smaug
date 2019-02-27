#!/usr/bin/env node
/**
 * @file
 *
 * Fetch library info using openAgency webservice findLibrary endpoint
 *
 * run something like: ./fetchLibraries -w http://openagency.addi.dk/2.34 -o myLibraryFile.json
 *
 */

const fs = require('fs');
const request = require('request');
const stdio = require('stdio');

const selectField = ['agencyId', 'agencyName', 'postalCode', 'city', 'agencyEmail'];
const option = getOptions();

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

    const result = [];
    body.findLibraryResponse.pickupAgency.forEach(agency => {
      if (agency.branchType.$ === 'H') {
        const item = {};
        selectField.forEach(a => {
          item[a] = agency[a] ? agency[a].$ : '';
        });
        result.push(item);
      }
    });

    const outfile = fs.openSync(option.output, 'w');
    fs.writeSync(outfile, JSON.stringify(result), null, 'utf8');
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
    output: {key: 'o', args: 1, description: 'Output file'}
  });
  if (!ops.openAgency || !ops.output) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}

