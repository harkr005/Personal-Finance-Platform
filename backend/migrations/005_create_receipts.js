exports.up = function(knex) {
  return knex.schema.createTable('receipts', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.string('file_path').notNullable();
    table.text('extracted_text');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('receipts');
};
