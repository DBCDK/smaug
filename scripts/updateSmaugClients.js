#!/usr/bin/env node
/**
 * @file
 *
 * Recieves a smaug object as a string, retrieves config part and adds a new key to that part.
 * Then creates a curl string that can be used to update that id in smaug.
 * Created together with createUpdateScript.sh that calls this script
 * Should you run it from a bash it is done like this:
 * ./updateSmaugClients.js -s "https://auth-admin-stg.dbc.dk" -p "admin:password" -o '{ "id": "c9520dff-1685-46ea-bfe9-d2a24651bc6f", "config": { } }'
 *
 */

const stdio = require('stdio');
const option = getOptions();

const smaugObject = JSON.parse(option.smaugObject);
smaugObject.config["singleLogoutPath"] = "/adgangsplaformen/logout/iframe";

const id = smaugObject.id;

const curlLine = "curl -X PUT -H \"Content-Type: application/json\" --user " + option.smaugUserPwd + " " +  option.smaugAdminUrl + "/clients/" + id + " -d '{\"config\":" + JSON.stringify(smaugObject.config) + "}'";
console.log(curlLine);


/**
 * Handles options and produce Usage:
 *
 * @returns {*}
 */
function getOptions() {
  const ops = stdio.getopt({
    smaugObject:{key: 'a', args: 1, description: 'smaug object'},
    smaugUserPwd: {key: 'p', args: 1, description: 'smaug admin user:password'},
    smaugAdminUrl: {key: 's', args: 1, description: 'smaug admin endpoint, ex: https://auth-admin-stg.dbc.dk'}
  });
  if (!ops.smaugObject || !ops.smaugUserPwd || !ops.smaugAdminUrl) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}
