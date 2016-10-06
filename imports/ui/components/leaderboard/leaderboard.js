import './leaderboard.html';
import '../players/player.js';
import { PlayersIndex } from '../../../api/players/players_index.js';

Template.leaderboard.helpers({
	inputAttributes: function () {
		return { 'class': 'easy-search-input', 'placeholder': 'Start searching...' };
	},
	players: function () {
		return Players.find({}, { sort: { score: -1, name: 1 } });
	},
	selectedName: function () {
		var player = PlayersIndex.config.mongoCollection.findOne({ __originalId: Session.get("selectedPlayer") });
		return player && player.name;
	},
	index: function () {
		return PlayersIndex;
	},
	resultsCount: function () {
		return PlayersIndex.getComponentDict().get('count');
	},
	showMore: function () {
		return false;
	},
	renderTmpl: () => Template.renderTemplate
});

Template.leaderboard.events({
	'click .inc': function () {
		Meteor.call('updateScore', Session.get("selectedPlayer"));
	},
	'change .category-filter': function (e) {
		PlayersIndex.getComponentMethods()
			.addProps('categoryFilter', $(e.target).val())
		;
	}
});
