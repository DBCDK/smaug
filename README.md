# Smaug

Smaug is a system for granting OAuth2 access tokens, and mapping them to JSON-formatted configuration objects.

## Setup development environment

Create a .env file [.env-example](/examples/config/.env-example) in the root of the project with the following environment variables:

```shell
PORT=3001 # Main/oAuth application port
PORT_ADMIN=3002 # Port for admin application
PORT_CONFIG=3003 # Port for config application

CULR_URI="https://culr.addi.dk/1.4/CulrWebService?wsdl" # uri to CULR WSDL
CULR_USER_ID_AUT="xxx" # CULR auth
CULR_GROUP_ID_AUT=xxx # CULR auth
CULR_PASSWORD_AUT="xxx" # CULR auth

DATABASE_URI="postgres://postgres:postgres@localhost:5432/smaug" # Postgres connection string
REDIS="redis://localhost:6379" # Redis uri

ADMIN_USERS={"admin": "admin"} # list of admin users (as JSON)

DEFAULT_LIBRARY_ID="190101" # default library id used with borchk if not specified by requester
SERVICE_REQUESTER="login.bib.dk" # servicerequester used with borchk
BORCHK_WSDL="https://borchk.addi.dk/2.5.0/?wsdl" # uri for Borchk WSDL

# default client configuration
CONFIG_USER_SALT="some_salt" # salt for user ID
CONFIG_NETPUNKT_USER="xxx" # netpunkt auth
CONFIG_NETPUNKT_GROUP="xxx" # netpunkt auth
CONFIG_NETPUNKT_PASSWORD="xxx" # netpunkt auth
CONFIG_PERFORMANCE_PASSWORD='xxx' # Login to zabbix
CONFIG_PERFORMANCE_USERNAME='xxx' # Login to zabbix
```

## OAuth2

### Supported grant types

- Client Credentials

### Requesting an annonymous access token

`curl --user "$CLIENT_ID":"$CLIENT_SECRET" -X POST https://$smaugLocation/oauth/token -d 'grant_type=password&username=@&password=@'`

### Requesting an annonymous access token for a specific library

`curl --user "$CLIENT_ID":"$CLIENT_SECRET" -X POST https://$smaugLocation/oauth/token -d 'grant_type=password&username=@$LIBRARY_ID&password=@$LIBRARY_ID'`

### Requesting an authenticated access token

`curl --user "$CLIENT_ID":"$CLIENT_SECRET" -X POST https://$smaugLocation/oauth/token -d 'grant_type=password&username=$CONSUMER_USERID@CONSUMER_LIBRARYID&password=$CONSUMER_PASSWORD'`

## Configuration

Get: `curl http://$smaugLocation/configuration?token=...`

## Example requests

### health

```
# perform health check; returns http 200 on 'ok', http 500 if not ok. Works for all types of ports.
curl https://localhost:$PORT/health
{
  "ok":
  {
    "agencyStore": { "responseTime": 1 },
    "clientStore": { "responseTime": 16 },
    "configStore": { "responseTime": 1 },
    "tokenStore": { "responseTime": 16 }
  }
}
```

### Admin

#### tokens

```
# request access token
# curl --user client_id:client_secret -X POST http://localhost:$PORT_OAUTH/oauth/token -d 'grant_type=password&username=username@010101&password=password'
# eg:
curl --user "c0ba685e-2130-4e24-b4e9-4a903fe71ada":duck -X POST http://localhost:3001/oauth/token -d 'grant_type=password&username=donald@010101&password=duck'
{
  "token_type": "bearer",
  "access_token": "f523776caa3871cabf52668c34c09445267feace",
  "expires_in": 2592000
}
```

#### clients

```
# list clients
curl --user admin:password -X GET -H "Content-Type: application/json" http://localhost:$PORT_ADMIN/clients
[
  {
    "name": "duckDevLTD",
    "id": "c0ba685e-2130-4e24-b4e9-4a903fe71ada"
  }
]
```

```
# create client with name=foo
curl --user admin:password -X POST -H "Content-Type: application/json" http://localhost:$PORT_ADMIN/clients -d '{"name": "foo"}'
{
  "name": "foo",
  "id": "b0819839-6bbf-4218-9895-2ddde8e0d32a"
}
```

```
# get client
curl --user admin:password -X GET http://localhost:$PORT_ADMIN/clients/b0819839-6bbf-4218-9895-2ddde8e0d32a
{
  "name": "foo",
  "id": "b0819839-6bbf-4218-9895-2ddde8e0d32a"
}
```

```
# update client
curl --user admin:password -X PUT -H "Content-Type: application/json" http://localhost:$PORT_ADMIN/clients/b0819839-6bbf-4218-9895-2ddde8e0d32a -d '{"name": "bar"}'
{
  "name": "bar",
  "id": "b0819839-6bbf-4218-9895-2ddde8e0d32a"
}
```

```
# delete client
curl --user admin:password -X DELETE http://localhost:$PORT_ADMIN/clients/b0819839-6bbf-4218-9895-2ddde8e0d32a
{}
```

```
# get token for client
curl --user admin:password -X POST http://localhost:$PORT_ADMIN/clients/token/b0819839-6bbf-4218-9895-2ddde8e0d32a -d 'grant_type=password&username=donald@010101&password=duck'
{
  "token_type": "bearer",
  "access_token": "f523776caa3871cabf52668c34c09445267feace",
  "expires_in": 2592000
}
```

```
# get authenticated token without specifying password
curl --user admin:password -X POST http://localhost:$PORT_ADMIN/clients/token/b0819839-6bbf-4218-9895-2ddde8e0d32a -d 'grant_type=password&username=donald@010101'
{
  "token_type": "bearer",
  "access_token": "f523776caa3871cabf52668c34c09445267feace",
  "expires_in": 2592000
}


#### config

```

# list config

curl --user admin:password http://localhost:$PORT_ADMIN/config

```

```
