exports.up = function(knex) {
  return knex.schema.createTable('accounts', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('type').notNullable(); // checking, savings, credit, investment
    table.decimal('balance', 15, 2).defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('accounts');
};
