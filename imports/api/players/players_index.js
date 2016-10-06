import { Players } from './players.js';
import { EasySearch } from 'meteor/easy:search';
import { _ } from 'meteor/underscore';

export const PlayersIndex = new EasySearch.Index({
  engine: new EasySearch.MongoDB({
    sort: function () {
      return { score: -1 };
    },
    selector: function (searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(searchObject, options, aggregation),
        categoryFilter = options.search.props.categoryFilter;

      if (_.isString(categoryFilter) && !_.isEmpty(categoryFilter)) {
        selector.category = categoryFilter;
      }

      return selector;
    }
  }),
  collection: Players,
  fields: ['name'],
  defaultSearchOptions: {
    limit: 8
  },
  permission: () => {
    //console.log(Meteor.userId());

    return true;
  }
});
