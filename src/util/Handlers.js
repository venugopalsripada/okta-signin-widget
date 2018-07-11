/*!
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define(['okta', 'util/Logger'], function (Okta, Logger) {

  var Handlers = {};
  var _ = Okta._;

  Handlers.defaultSuccessTokenHandler = function(tokenManager, keys = {}) {
    /**
     * Default success handler which is normally invoked when
     * `parseTokenFromUrl` is called. This success handler will
     * automatically store the tokens with the keys "accessToken" and
     * "idToken", if returned in the response.
     */

    var tokenKeys = {
      accessToken: keys.accessToken || 'accessToken',
      idToken: keys.idToken || 'idToken'
    };

    return function (res) {
      var tokens = Array.isArray(res) ? res : [res];
      for (var i = 0; i < tokens.length; ++i) {
        if (tokens[i].idToken) {
          tokenManager.add(tokenKeys.idToken, tokens[i]);
        } else if (tokens[i].accessToken) {
          tokenManager.add(tokenKeys.accessToken, tokens[i]);
        }
      }
    };
  };

  Handlers.defaultErrorHandler = function() {
    /**
     * Default error handler that outputs the
     * response using the window.console in "error" form.
     */
    return function (err) {
      Logger.error(err.toString());
    };
  };

  Handlers.filterOAuthParams = function(options, config) {
    // Override specific OAuth/OIDC values
    var renderOptions = {
      clientId: options.clientId,
      redirectUri: options.redirectUri,
      authParams: {
        display: 'page',
        issuer: options.authorizationServerId,
        responseMode: 'fragment',
        responseType: ['id_token']
      }
    };

    if (options.getAccessToken) {
      renderOptions.authParams.responseType.push('token');
    }

    // Override undefined values with SignIn config
    // This will include buttons, assets, etc.
    _.defaults(renderOptions, config);

    var configScopes = config.authParams && config.authParams.scopes;
    var scope = options.scope || (configScopes && configScopes.join(' '));

    // Remove the 'openid' scope. We'll add it only if needed
    scope = scope && scope.replace('openid', '').trim();

    if (options.getIdToken === false) {
      // Remove 'id_token' (always the first arg)
      renderOptions.authParams.responseType.shift();
    } else {
      // Add the 'openid' scope
      scope = scope ? `${scope} openid` : 'openid';
    }

    renderOptions.authParams.scopes = scope ? scope.split(' ') : undefined;

    // Remove undefined values
    return JSON.parse(JSON.stringify(renderOptions));
  };

  return Handlers;
});
