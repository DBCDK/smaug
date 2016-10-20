#!/bin/sh

set -euf

export PORT_OAUTH=8001
export PORT_CONFIG=8002
export PORT_ADMIN=8003

cd /opt/smaug
sleep 1
npm run migrate
node /opt/smaug/src/main.js -f /opt/smaug/examples/config/docker-config.json
