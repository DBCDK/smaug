# Smaug

[![Build Status](https://travis-ci.org/DBCDK/smaug.svg?branch=master)](https://travis-ci.org/DBCDK/smaug)

Smaug is a system for granting OAuth2 access tokens, and mapping them to JSON-formatted configuration objects.


## OAuth2

### Supported grant types

* Client Credentials


### Requesting an annonymous access token

`curl --user "$CLIENT_ID":"$CLIENT_SECRET" -X POST https://$smaugLocation/oauth/token -d 'grant_type=password&username=@&password=@'`

### Requesting an annonymous access token for a specific library

`curl --user "$CLIENT_ID":"$CLIENT_SECRET" -X POST https://$smaugLocation/oauth/token -d 'grant_type=password&username=@$LIBRARY_ID&password=@$LIBRARY_ID'`

### Requesting an authenticated access token

`curl --user "$CLIENT_ID":"$CLIENT_SECRET" -X POST https://$smaugLocation/oauth/token -d 'grant_type=password&username=$CONSUMER_USERID@CONSUMER_LIBRARYID&password=$CONSUMER_PASSWORD'`

## Configuration

Get: `curl http://$smaugLocation/configuration?token=...`


## Getting up and running

1. `git clone ...`
2. `npm install`
3. `node src/main.js -f config.json`


## Example requests

### health

```
# perform health check; returns http 200 on 'ok', http 500 if not ok. Works for all types of ports.
curl https://localhost:$PORT/health
{
  "clientStore": "ok",
  "configStore": "ok",
  "userStore": "ok",
  "tokenStore": "ok"
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


#### config

```
# list config
curl --user admin:password http://localhost:$PORT_ADMIN/config
```
