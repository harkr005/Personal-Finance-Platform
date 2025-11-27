exports.up = function(knex) {
  return knex.schema.createTable('transactions', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('account_id').references('id').inTable('accounts').onDelete('CASCADE');
    table.date('date').notNullable();
    table.string('merchant');
    table.text('description');
    table.string('category');
    table.decimal('amount', 15, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};
