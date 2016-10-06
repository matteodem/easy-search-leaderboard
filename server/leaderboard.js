import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players/players.js';
import { check } from 'meteor/check';

Meteor.methods({
  updateScore: function (playerId) {
    check(playerId, String);
    Players.update(playerId, { $inc: { score: 5 }});
  }
});
