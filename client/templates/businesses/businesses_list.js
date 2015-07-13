Template.businessesList.onCreated(function () {
  this.loading = new ReactiveVar;
});

Template.businessPage.onRendered(function () {
  var favoriteExists = Favorite.findOne({userId: Meteor.user()._id, businessId: this.data._id});
  if (favoriteExists) {
    $('.favorite-button').addClass('favorite-active');  
  }
});

Template.businessesList.helpers({
  results: function () {
    return Search.find();
  }
});

Template.businessesList.rendered = function () {
  var self = this;
  self.autorun(function () {
    if (self.loading.get()) {
      IonLoading.show();
    } else {
      IonLoading.hide();
    }
  })
};

Template.businessesList.events({
  'click [data-action=getResults]': function (event, template) {
    template.loading.set(true);
    event.preventDefault();
    getLocation();
    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        IonPopup.alert({
          title: 'Alert',
          template: 'Geolocation is not supported by this browser.',
          okText: 'Ok.'
        });
      }
    }
    function showPosition(position) {        
      var long, lat; 
      lat = position.coords.latitude;
      long = position.coords.longitude; 
      Meteor.subscribe('search', lat, long, function () {
        template.loading.set(false);
      });
    }
  },
  'keyup form #filter': function (event, tpl) {
    event.preventDefault();
    var filter = tpl.$('[name=search]').val(), count = 0;
    var resultsCount = document.getElementById('results-count');
    var regex = new RegExp(filter, 'i');
    $('.results-list').each(function () {
      if ($(this).text().search(regex) < 0) {
        $(this).hide();
      } else {
        $(this).show();
        count++
      }
      $('#results-count').text('Results ' + count);
    });
    return false;
  },
  'click [data-action=logout]': function (event) {
    event.preventDefault();
    Meteor.logout(function () {
      Router.go('index')
    });
  }
});
