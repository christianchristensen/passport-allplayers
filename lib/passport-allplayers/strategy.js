/**
 * Module dependencies.
 */
var querystring = require('querystring')
  , util = require('util')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy;


/**
 * `Strategy` constructor.
 *
 * The AllPlayers authentication strategy authenticates requests by delegating to
 * AllPlayers using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to AllPlayers
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *   - `callbackURL`     URL to which AllPlayers will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new AllPlayersStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/allplayers/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL = options.requestTokenURL || 'https://www.allplayers.com/oauth/request_token';
  options.accessTokenURL = options.accessTokenURL || 'https://www.allplayers.com/oauth/access_token';
  var params = { oauth_callback: options.callbackURL };
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://www.allplayers.com/oauth/authorize?' + querystring.stringify(params);
  options.sessionKey = options.sessionKey || 'oauth:allplayers';

  OAuthStrategy.call(this, options, verify);
  this.name = 'allplayers';
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuthStrategy);

/**
 * Retrieve user profile from AllPlayers.
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
  this._oauth.get('https://www.allplayers.com/api/v1/rest/users/current', token, tokenSecret, function (err, body, res) {
    if (err) { return done(err); }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'allplayers' };
      profile.id = json.uuid;
      profile.displayName = json.username;
      profile.emails = [{ value: json.email }];
      
      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
