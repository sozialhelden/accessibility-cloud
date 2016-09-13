import { Meteor } from 'meteor/meteor';
// import { Lists } from '../../api/lists/lists.js';
// import { Todos } from '../../api/todos/todos.js';

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  // if (Lists.find().count() === 0) {
  //   const data = [
  //   ];
  //
  //   let timestamp = (new Date()).getTime();
  //
  //   data.forEach((list) => {
  //     const listId = Lists.insert({
  //       name: list.name,
  //       incompleteCount: list.items.length,
  //     });
  //
  //     list.items.forEach((text) => {
  //       Todos.insert({
  //         listId,
  //         text,
  //         createdAt: new Date(timestamp),
  //       });
  //
  //       timestamp += 1; // ensure unique timestamp.
  //     });
  //   });
  // }
});
