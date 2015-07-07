Meteor.startup(function () {
  if(!Accounts.loginServiceConfiguration.findOne({service: 'yelp'})) {
    Accounts.loginServiceConfiguration.insert({
      service: "yelp",
      consumerKey: YELP.CONSUMERKEY,
      consumerSecret: YELP.CONSUMERSECRET,
      accessToken: YELP.ACCESSTOKEN,
      accessTokenSecret: YELP.ACCESSTOKENSECRET,
      signatureMethod: "HMAC-SHA1"
    });
  }
});

Meteor.publish('results', function (latitude, longitude) {
  var self = this;

  if (Results.findOne()) {
    Results.remove({});
  }

  var auth = Accounts.loginServiceConfiguration.findOne({service: 'yelp'});

  var config = {
    consumerKey: auth.consumerKey,
    secret: auth.consumerSecret,
  };

  var parameters = {
    term: 'food',
    ll: latitude + ',' + longitude,
    // open_now: 8439, 
    sort: 2,
    oauth_token: auth.accessToken
  };
  var oauthBinding = new OAuth1Binding(config, 'http://api.yelp.com/v2/search');
  oauthBinding.accessTokenSecret = auth.accessTokenSecret;
  
  var results = oauthBinding.call('GET', oauthBinding._urls, parameters);
  _.each(results.data.businesses, function (result) {
    self.added('results', result.id, result);
  });

  self.ready();

});