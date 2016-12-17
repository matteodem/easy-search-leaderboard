import { PlayersIndex } from '../../api/players/players_index.js';

Meteor.publish('test-search', function (searchTerm) {
  const { userId } = this;

  return PlayersIndex.search(searchTerm, { userId }).mongoCursor;
});
