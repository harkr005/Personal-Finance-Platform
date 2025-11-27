exports.up = function(knex) {
  return knex.schema.createTable('budgets', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('category').notNullable();
    table.decimal('limit_amount', 15, 2).notNullable();
    table.integer('month').notNullable();
    table.integer('year').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('budgets');
};
