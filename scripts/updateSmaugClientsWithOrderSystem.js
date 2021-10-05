#!/usr/bin/env node
/**
 * @file
 *
 * Receives a smaug object as a string, retrieves config part and adds a new key to that part.
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

console.log("echo displayName: ", smaugObject["config"]["displayName"]);

//Add DDB CMS as label to all clients in this batch:
smaugObject["config"]["label"] = "DDB CMS";

// Only add moreinfo access if it is not in the config file
if (smaugObject["config"]["orderSystem"]) {
  if (smaugObject["config"]["orderSystem"] === "ddbcms") {
    console.log("echo " + id + " has allready ordersystem set as 'ddbcms'")
    return "";
  } else {
    console.log("echo orderSystem allready set to: ", smaugObject["config"]["orderSystem"]);
  }
} else {
  smaugObject["config"]["orderSystem"] = "ddbcms";
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
