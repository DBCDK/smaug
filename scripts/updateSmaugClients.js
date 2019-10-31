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
var bibArray = option.bibArray.split(",");
const agencyId = bibArray.shift();


// indsæt agencyId
var updateObjectKey = "agencyId";
var updateObjectContent = agencyId;
// skal der oprettes agencyId med tom streng hvis biblioteket ikke har et agencyId?
// smaugObject["config"][updateObjectKey] = updateObjectContent;

// skal der kun oprettes agencyId hvis biblioteket har et agencyId?
if (updateObjectContent) {
  smaugObject["config"][updateObjectKey] = updateObjectContent;
}

// opdater redirectUris
updateObjectKey = "redirectUris";
var hasReturnUrl = false;
smaugObject["config"][updateObjectKey] = [];
const https = "https://";
const callback = "/adgangsplatformen/callback";
const slash = "/";
for (var i = 0; i < bibArray.length; i++) {
  updateObjectContent = bibArray[ i ];
  if ( updateObjectContent ) {
    hasReturnUrl = true;
    smaugObject["config"][updateObjectKey].push(https + updateObjectContent + callback);
    smaugObject["config"][updateObjectKey].push(https + updateObjectContent + slash);
    smaugObject["config"][updateObjectKey].push(https + updateObjectContent);
  }
}
if (!hasReturnUrl) {
  smaugObject["config"][updateObjectKey] = ["https://*/adgangsplatformen/callback", "https://*/", "https://*"];
}

//indsæt attributes object i config.
smaugObject["config"]["attributes"] = {
  "cpr": {
    "name": "CPR-nummer",
      "description": "Brugerens CPR-nummer"
  },
  "userId": {
    "name": "Biblioteks bruger-id",
      "description": "Brugerens identitet på biblioteket - oftest CPR-nummer"
  },
  "pincode": {},
  "uniqueId": {
    "name": "bruger ID",
      "description": "Unikt bruger ID, som ikke er personhenførbar"
  },
  "libraries": {
    "name": "Biblioteker",
      "description": "En liste over de biblioteker som kender brugeren"
  },
  "municipality": {
    "name": "Kommunenummer",
      "description": "3 cifret kommunenummer"
  }
};

// If config is only to be updated when empty, then use this block of code
// updateObjectKey = "redirectUris";
// updateObjectContent = returnUrl;
// if (!smaugObject["config"][updateObjectKey]) {
//   smaugObject["config"][updateObjectKey] = updateObjectContent;
// } else {
//   console.log("echo " + updateObjectKey + " is already set for id: " + id + ". Contains: " + smaugObject.config[updateObjectKey]);
// }


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
    bibArray:{key: 'b', args: 1, description: 'library information array'},
    smaugUserPwd: {key: 'p', args: 1, description: 'smaug admin user:password'},
    smaugAdminUrl: {key: 's', args: 1, description: 'smaug admin endpoint, ex: https://auth-admin-stg.dbc.dk'}
  });
  if (!ops.smaugObject || !ops.smaugUserPwd || !ops.smaugAdminUrl) {
    ops.printHelp();
    process.exit(1);
  }
  return ops;
}
