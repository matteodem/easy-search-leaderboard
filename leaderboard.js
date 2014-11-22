// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

var categories = ["Genius", "Geek", "Hipster", "Gangster", "Worker"]

if (Meteor.isClient) {

  Meteor.startup(function () {
    Meteor.call('allDocs', function (err, count) {
      Session.set('allDocs', count);
    })
  });

  Template.leaderboard.helpers({
    selected_name: function() {
      var player = Players.findOne(Session.get("selected_player"));
      return player && player.name;
    },

    showAutosuggest: function() {
      return Session.get('showAutosuggest');
    },
    suggestionTpl: function() {
      return Template.suggestion;
    },
    category: function() {
      return ['All'].concat(categories);
    },
    allDocs: function () {
      return Session.get('allDocs');
    }
  });

  Template.leaderboard.events({
    'click .inc': function(e) {
      var player = Session.get('selected_player');

      if (!player) {
        return;
      }

      Players.update(Session.get('selected_player'), {
        $inc: {
          score: parseInt($(e.target).data('val'), 10)
        }
      });
    },
    'click .show-autosuggest': function(e) {
      Session.set('showAutosuggest', !Session.get('showAutosuggest'));

      e.preventDefault();
    },
    'change select': function(e) {
      var instance = EasySearch.getComponentInstance({
        index: 'players',
        id: 'search'
      });

      EasySearch.changeProperty('players', 'filteredCategory', $(e.target).val());
      EasySearch.changeLimit('players', 10);

      instance.triggerSearch();
    }
  });

  Template.player.helpers({
    selected: function() {
      return Session.equals("selected_player", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function() {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function() {
    var first_names = ["Ada",
      "Grace",
      "Marie",
      "Carl",
      "Nikola",
      "Claude",
      "Peter",
      "Stefan",
      "Stephen",
      "Lisa",
      "Christian",
      "Barack"
    ],
      last_names = ["Lovelace",
        "Hopper",
        "Curie",
        "Tesla",
        "Shannon",
        "Müller",
        "Meier",
        "Miller",
        "Gaga",
        "Franklin"
      ];

      Meteor.methods({
        allDocs : function () {
          return Players.find().count();
        }
      });

    if (Players.find().count() === 0) {
      // one hunderd thousand docs :O
      for (var i = 0; i < 100 * 1000; i++) {
        console.log(i + ' doc indexed');
        Players.insert({
          name: Random.choice(first_names) + ' ' + Random.choice(last_names),
          score: Math.floor(Random.fraction() * 1000 / Random.fraction() / 100),
          category: Random.choice(categories)
        });
      }

      console.log('done!');
    }
  });
}

// on Client and Server
EasySearch.createSearchIndex('players', {
  'collection': Players, // instanceof Meteor.Collection
  'field': ['name', 'score'], // array of fields to be searchable
  'limit': 10,
  'convertNumbers': true,
  'props': {
    'filteredCategory': 'All'
  },
  'sort': function() {
    return { 'score': -1, 'name': -1 };
  },
  'query': function(searchString) {
    // Default query that will be used for the mongo-db selector
    var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString);

    // filter for categories if set
    if (this.props.filteredCategory.toLowerCase() !== 'all') {
      query.category = this.props.filteredCategory;
    }

    return query;
  }
});
