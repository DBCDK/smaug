ARG NODE_BASEIMAGE=docker.dbc.dk/node10:latest
# ---- Base Node ----
FROM  $NODE_BASEIMAGE AS build
# set working directory
WORKDIR /home/node/app
# copy project file
COPY src/ src/
COPY .babelrc .
COPY package.json .
COPY examples/config/config-stg.json config.json

ENV CI=true

# install node packages
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --only=production

RUN mkdir prod_build && \
    cp -R --preserve=links node_modules prod_build/node_modules && \
    npm install

# build statics
#RUN npm run build && \
RUN cp -R --preserve=links src prod_build/src && \
    cp -R config.json prod_build/config.json && \
    cp -R package.json prod_build/package.json && \
    cp -R .babelrc prod_build/.babelrc

# run test @see package.json
#RUN npm run test

#
# ---- Release ----
FROM $NODE_BASEIMAGE AS release
WORKDIR /home/node/app
RUN apt-get update && \
  apt-get install -y net-tools && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*
RUN apt-get update && \
  apt-get install -y  netcat telnet && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=build /home/node/app/prod_build ./
EXPOSE 3000
USER node
CMD node src/main.js -f config.json
