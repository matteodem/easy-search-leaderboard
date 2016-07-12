import './leaderboard.html';
import '../players/player.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { EasySearch } from 'meteor/easy:search';
import { Players } from '../../../api/players/players.js';
import { PlayersIndex } from '../../../api/players/players_index.js';
import { $ } from 'meteor/jquery';

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
