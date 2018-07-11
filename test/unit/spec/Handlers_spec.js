/* eslint max-len: [2, 140] */
define(['util/Handlers'], function (Handlers) {

  function assertAuthParams (response, extras) {
    // Contains default key/value pairs
    var defaults = {
      display: 'page',
      responseMode: 'fragment',
      responseType: ['id_token']
    };

    expect(response.authParams).toEqual(jasmine.objectContaining(Object.assign(defaults, extras)));
  }

  describe('util/Handlers', function () {

    describe('filterOAuthParams', function () {
      it('returns top-level configuration if no overrides are provided', function () {
        var config = {
          baseUrl: 'foo'
        };

        var renderOptions = Handlers.filterOAuthParams({}, config);
        assertAuthParams(renderOptions);
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('overrides configuration when overrides are provided', function () {
        var config = {
          baseUrl: 'foo',
          authParams: {
            scope: 'bazz'
          }
        };
        var options = {
          scope: 'foo'
        };
        var renderOptions = Handlers.filterOAuthParams(options, config);
        assertAuthParams(renderOptions, { scopes: ['foo', 'openid'] });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('updates the responseType given getAccessToken and getIdToken keys', function () {
        var config = {
          baseUrl: 'foo'
        };
        var options = {
          getAccessToken: true
        };
        var renderOptions = Handlers.filterOAuthParams(options, config);
        assertAuthParams(renderOptions, { responseType: ['id_token', 'token'], scopes: ['openid'] });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('maps the authorizationServerId key to issuer', function () {
        var config = {
          baseUrl: 'foo'
        };
        var options = {
          authorizationServerId: 'default'
        };
        var renderOptions = Handlers.filterOAuthParams(options, config);
        assertAuthParams(renderOptions, { issuer: 'default' });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('returns a complex object, overriding the basic Widget configuration option', function () {
        var config = {
          baseUrl: 'foo',
          clientId: 'cid',
          authParams: {
            responseType: ['id_token'],
            scopes: ['openid']
          }
        };
        var options = {
          getAccessToken: true,
          scope: 'openid profile',
          clientId: 'bar'
        };
        var renderOptions = Handlers.filterOAuthParams(options, config);
        assertAuthParams(renderOptions, {
          responseType: ['id_token', 'token'],
          // 'openid' should always be last
          scopes: ['profile', 'openid']
        });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
        expect(renderOptions).toEqual(jasmine.objectContaining({ clientId: 'bar' }));
      });
    });

  });

});
