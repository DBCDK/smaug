#!/usr/bin/env bash

# This script calls smaug based on an list of ids and get a client data object, then updates that object data with new
# content in config and outputs to stdout in a shellscript format that can be saved and executed.

if [ $# -lt 4 ]
then
    echo 'Please call this script with 4 parameters. Examples:'
    echo './createUpdateScript.sh "user:password" "https://auth-admin-stg.dbc.dk" updateSmaugClientsWithOrderSystem.js ~/indata/smaug-id-libraries'
    echo './createUpdateScript.sh "user:password" "https://auth-admin.dbc.dk" updateSmaugClientsWithOrderSystem.js ~/indata/smaug-id-libraries '
    exit 1
fi

smaugUserPwd=$1
smaugAdminUrl=$2
jsScript=$3
idsFile=$4

echo "#!/usr/bin/env bash"
echo ""

ids=$(cat $idsFile)
for id in $ids
do
    #echo "echo update client data for id: $id"
    smaugObject=$(curl -X GET --user $smaugUserPwd $smaugAdminUrl/clients/${id} 2>/dev/null)
    ./$jsScript -o "$smaugObject" -p $smaugUserPwd -s $smaugAdminUrl
done
