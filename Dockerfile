ARG NODE_BASEIMAGE=docker.dbc.dk/dbc-node:latest
# ---- Base Node ----
FROM  $NODE_BASEIMAGE AS build
# set working directory
WORKDIR /home/node/app
# copy project file
COPY src/ src/
COPY fixtures/ fixtures/
COPY test/ test/
COPY .babelrc .
COPY .eslintrc .
COPY package.json .

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
  cp -R --preserve=links fixtures prod_build/fixtures && \
  cp -R package.json prod_build/package.json && \
  cp -R .babelrc prod_build/.babelrc

# run test @see package.json
RUN npm run test && npm run lint

#
# ---- Release ----
FROM $NODE_BASEIMAGE AS release
ENV  BABEL_CACHE_PATH=~/app/babel.cache.json
WORKDIR /home/node/app
COPY --chown=node:node --from=build /home/node/app/prod_build ./
EXPOSE 3000
USER node
CMD node src/main.js
