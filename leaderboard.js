// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
TestCollection = new Meteor.Collection('testData');

var categories = ["Genius", "Geek", "Hipster", "Gangster", "Worker"];

Router.route('/', function () {
  this.render('home');
});

Router.route('/test', function () {
  this.render('test');
});

if (Meteor.isClient) {
  Meteor.subscribe('allDocs');

  Meteor.startup(function () {
    Meteor.call('allDocs', function (err, count) {
      Session.set('allDocs', count);
    })
  });

  Template.leaderboard.helpers({
    selected_name: function() {
      var currentPlayer = Session.get("selected_player"),
        player = EasySearch.getIndex('players').findOne();
      
      if (currentPlayer) {
          return player && player.name;
      }
    },
    showAutosuggest: function() {
      return Session.get('showAutosuggest');
    },
    showMultipleIndexes: function() {
      return Session.get('showMultipleIndexes');
    },
    indexes: function () {
      return ['testData', 'localPlayers'];
    },
    suggestionTpl: function() {
      return Template.suggestion;
    },
    category: function() {
      return ['All'].concat(categories);
    },
    allDocs: function () {
      return Session.get('allDocs');
    },
    playerNames: function () {
      return _.first(_.uniq(Players.find().map(function (doc) {
        return doc.name;
      })), 5).join(', ');
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
    'click .show-multiple-indexes': function(e) {
      Session.set('showMultipleIndexes', !Session.get('showMultipleIndexes'));
      e.preventDefault();
    },
    'change .filter-select': function(e) {
      var instance = EasySearch.getComponentInstance({
        index: 'players',
        id: 'search'
      });

      EasySearch.changeProperty('players', 'filteredCategory', $(e.target).val());
      EasySearch.changeLimit('players', 10);

      instance.paginate(1);
      instance.triggerSearch();
    },
    'change .sort-select': function(e) {
      var instance = EasySearch.getComponentInstance({
        index: 'players',
        id: 'search'
      });

      EasySearch.changeProperty('players', 'sortBy', $(e.target).children(':selected').data('sort'));
      EasySearch.changeLimit('players', 10);

      instance.paginate(1);
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
    
    Meteor.publish('allDocs', function () {
      return [
        Players.find({}, { limit: 10 }),
        TestCollection.find({})
      ];
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

    if (TestCollection.find().count() === 0) {
      for (var i = 0; i < 10; i += 1) {
        TestCollection.insert({
          data: 'Peter Stephen Carl Marie Lisa GAGA ' + i
        });
      }
    }
  });
}

// Search Index for the main players search
EasySearch.createSearchIndex('players', {
  'collection': Players, // instanceof Meteor.Collection
  'field': ['name', 'score'], // array of fields to be searchable
  'limit': 10,
  'use' : 'mongo-db',
  'convertNumbers': true,
  'props': {
    'filteredCategory': 'All',
    'sortBy': 'score'
  },
  'sort': function() {
    if (this.props.sortBy === 'name') {
      return { 'name': 1 };
    }  else if (this.props.sortBy === 'lowest-score') {
      return { 'score': 1 };
    }

    // default by highest score
    return { 'score': -1 };
  },
  'query': function(searchString, opts) {
    // Default query that will be used for the mongo-db selector
    var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString);

    console.log(opts);

    // filter for categories if set
    if (this.props.filteredCategory.toLowerCase() !== 'all') {
      query.category = this.props.filteredCategory;
    }

    return query;
  }
});

/*EasySearch.createSearchIndex('players', {
  'collection': Players, // instanceof Meteor.Collection
  'field': ['name'], // array of fields to be searchable
  'limit': 10,
  'use' : 'elastic-search',
  'convertNumbers': true,
  'props': {
    'filteredCategory': 'All',
    'sortBy': 'score'
  },
  'sort': function() {
    return ['_score'];
  }
});*/

// Search Index for the autosuggest field
EasySearch.createSearchIndex('playersAutosuggest', {
  'collection': Players, 
  'use' : 'mongo-db',
  'field': ['name', 'score'],
  'convertNumbers': true
});

// Search Indexes for testing multiple indexes with one esInput
EasySearch.createSearchIndex('testData', {
  collection: TestCollection,
  field: 'data',
  use: 'minimongo'
});

EasySearch.createSearchIndex('localPlayers', {
  collection: Players,
  field: 'name',
  use: 'minimongo'
});
