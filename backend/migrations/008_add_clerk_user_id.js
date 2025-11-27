exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.string('clerk_user_id').unique().nullable();
    table.index('clerk_user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropIndex('clerk_user_id');
    table.dropColumn('clerk_user_id');
  });
};
