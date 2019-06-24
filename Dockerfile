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
COPY --chown=node:node --from=build /home/node/app/prod_build ./
EXPOSE 3000
USER node
CMD node src/main.js -f config.json


#Noter til Dockerfil:
#Kopier src og package.json og .babelrc
#env porte:
#export NODE_ENV=production
#export PORT=3000
#export LOG_LEVEL=DEBUG
#export PORT_CONFIG=3001
#export PORT_ADMIN=3002
#
#https://git.dbc.dk/config/smaug/files/36d94ff60d04174c80363d5fc4e40cfb8d1b7556/smaug-stg.json
#https://github.com/DBCDK/smaug


# Old Dockerfile:
#FROM docker-xp.dbc.dk/node:6
#MAINTAINER Adam F. Tulinius <atu@dbc.dk>
#
#ADD . /opt/smaug
#RUN cd /opt/smaug && npm install
#ADD docker/start-smaug.sh /bin/start-smaug.sh
#
#EXPOSE 8001
#EXPOSE 8002
#EXPOSE 8003
#
#CMD ["/bin/start-smaug.sh"]
