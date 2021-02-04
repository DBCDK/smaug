#!/usr/bin/env node
/**
 * @file
 *
 * Fetch library info using vipCore webservice findLibrary endpoint
 *
 * run something like: ./fetchLibraries -w http://vipcore.iscrum-vip-prod.svc.cloud.dbc.dk/1.0/api -o myLibraryFile.json
 *
 */

const fs = require('fs');
const request = require('request');
const stdio = require('stdio');

const selectField = ['agencyId', 'agencyName', 'postalCode', 'city', 'agencyEmail'];
const option = getOptions();

request({
    method: 'POST',
    url: option.vipCore.replace(/\/$/, '') + '/findlibrary',
    headers: {'Content-Type': 'application/json'},
    body: {pickupAllowed: 'true', libraryType: 'Folkebibliotek'},
    json: true
  }, function (error, response) {
    if (response.statusCode !== 200) {
      console.log('error status', response.statusCode);
      console.log('error', error);
      process.exit(1);
    }

    const body = response.body;
    if (!body.pickupAgency) {
      console.log('No libraries found - perhaps a hickup?');
      process.exit(1);
    }

    const result = [];
    body.pickupAgency.forEach(agency => {
      if (agency.branchType === 'H') {
        const item = {};
        selectField.forEach(a => {
          item[a] = agency[a] ? agency[a] : '';
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
    vipCore: {key: 'w', args: 1, description: 'vipCore endpoint'},
    output: {key: 'o', args: 1, description: 'Output file'}
  });
  if (!ops.vipCore || !ops.output) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}

