#!/usr/bin/env node
/**
 * @file
 *
 * Recieves a smaug object as a string, retrieves config part and adds a new key to that part.
 * Then creates a curl string that can be used to update that id in smaug.
 * Created together with createUpdateScript.sh that calls this script
 * Should you run it from a bash it is done like this:
 * ./updateSmaugClients.js -s "https://auth-admin-stg.dbc.dk" -p "admin:password" -o '{ "id": "c9520dff-1685-46ea-bfe9-d2a24651bc6f", "config": { } } -b "721700,Helsingør Bibliotek,https://helsbib.dk"'
 *
 */

const stdio = require('stdio');
const option = getOptions();

const smaugObject = JSON.parse(option.smaugObject);
const id = smaugObject.id;

// Only add moreinfo access if it is not in the config file
if (smaugObject["config"]["access"]) {
  if (smaugObject["config"]["access"].indexOf("moreinfo") > -1) {
    console.log("echo " + id + " has allready moreinfo in access-key")
    return "";
  } else {
    smaugObject["config"]["access"].push("moreinfo");
  }
} else {
  smaugObject["config"]["access"] = ["moreinfo"];
}


const curlLine = "curl -X PUT -H \"Content-Type: application/json\" --user " + option.smaugUserPwd + " " +  option.smaugAdminUrl + "/clients/" + id + " -d '{\"config\":" + JSON.stringify(smaugObject.config) + "}'";
console.log(curlLine);


/**
 * Handles options and produce Usage:
 *
 * @returns {*}
 */
function getOptions() {
  const ops = stdio.getopt({
    smaugObject:{key: 'o', args: 1, description: 'smaug object'},
    smaugUserPwd: {key: 'p', args: 1, description: 'smaug admin user:password'},
    smaugAdminUrl: {key: 's', args: 1, description: 'smaug admin endpoint, ex: https://auth-admin-stg.dbc.dk'}
  });
  if (!ops.smaugObject || !ops.smaugUserPwd) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}
