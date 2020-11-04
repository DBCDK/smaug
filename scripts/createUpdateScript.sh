#!/usr/bin/env bash

# This script calls smaug based on an list of ids and get a client data object, then updates that object data with new
# content in config and outputs to stdout in a shellscript format that can be saved and executed.

if [ $# -lt 3 ]
then
    echo 'Please call this script with 3 parameters. Examples:'
    echo './createUpdateScript.sh "user:password" "https://auth-admin-stg.dbc.dk" ~/indata/smaug-id-libraries ~/indata/smaug-information.tsv'
    echo './createUpdateScript.sh "user:password" "https://auth-admin.dbc.dk" ~/indata/smaug-id-libraries ~/indata/smaug-information.tsv'
    exit 1
fi

smaugUserPwd=$1
smaugAdminUrl=$2
idsFile=$3
dataFile=$4

echo "#!/usr/bin/env bash"
echo ""

ids=$(cat $idsFile)
for id in $ids
do
    echo "echo update client data for id: $id"
    smaugObject=$(curl -X GET --user $smaugUserPwd $smaugAdminUrl/clients/${id} 2>/dev/null)
    count=2
    if [ $count -gt 1 ]
    then
        ./updateSmaugClients.js -o "$smaugObject" -p $smaugUserPwd -s $smaugAdminUrl #-u "$urls"
    fi
done
