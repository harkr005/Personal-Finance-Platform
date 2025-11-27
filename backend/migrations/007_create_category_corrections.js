exports.up = function(knex) {
  return knex.schema.createTable('category_corrections', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.string('old_category').notNullable();
    table.string('new_category').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('category_corrections');
};
