import './player.html';
import { Template } from 'meteor/templating';

Template.player.helpers({
	selected: function () {
		return Session.equals("selectedPlayer", this.__originalId) ? "selected" : '';
	}
});

Template.player.events({
	'click': function () {
		Session.set("selectedPlayer", this.__originalId);
	}
});
