/**
 * @file
 * Custom flow for issuing authenticated tokens through admin endpoint.
 */

const error = require('oauth2-server/lib/error');
const generateToken = require('oauth2-server/lib/token');
import {userDecode} from '../utils';
import url from 'url';

function AdminGrant(app, req, res, next) {
  const user = userDecode(req.body.username);
  req.body.username = url.format({
    protocol: req.params.clientId,
    host: user.libraryId,
    auth: user.id,
    slashes: true
  });
  app.oauth.model.getUser(req.body.username, req.body.password, (err, user) => {
    if (err) return next(error('server_error', false, err));
    if (!user) {
      return next(error('invalid_client', 'User credentials are invalid'));
    }
    if (user) {
      const tokenStore = app.get('stores').tokenStore;
      generateToken(app.oauth, 'accessToken', (err, token) => {
        const clientId = req.params.clientId;
        const tokenExpiration =
          app.oauth.accessTokenLifetime || 60 * 60 * 24 * 30;
        const expires = new Date(Date.now() + tokenExpiration * 1000);
        tokenStore
          .storeAccessToken(token, clientId, expires, user)
          .then(() => tokenStore.getAccessToken(token))
          .then(tokenInfo =>
            sendResponse(res, next, tokenInfo, tokenExpiration)
          )
          .catch(error => next(new Error(error)));
      });
    }
  });
}

/**
 * Create an access token and save it with the model
 *
 * @param  {Function} done
 * @this   OAuth
 */
function sendResponse(res, next, tokenInfo, expires_in) {
  var response = {
    token_type: 'bearer',
    access_token: tokenInfo.accessToken
  };

  if (expires_in !== null) {
    response.expires_in = expires_in;
  }

  res.set({'Cache-Control': 'no-store', Pragma: 'no-cache'});
  res.jsonp(response);
  next();
}

module.exports = AdminGrant;
