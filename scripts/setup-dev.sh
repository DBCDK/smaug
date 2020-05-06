#!/bin/bash

migrate() {
  while !(DATABASE_URI="postgres://postgres:postgres@localhost:5432/smaug" npm run migrate); do sleep 5; done;
}

if [ "$1" == "down" ]; then
  docker-compose -f test/docker-compose-dev-test.yml down
else
  docker-compose -f test/docker-compose-dev-test.yml up & migrate
fi
