import { Players } from '../imports/api/players/players.js';

Meteor.methods({
  updateScore: function (playerId) {
    check(playerId, String);
    Players.update(playerId, { $inc: { score: 5 }});
  }
});
