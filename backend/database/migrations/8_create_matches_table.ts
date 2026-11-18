import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // FK's
      table
        .integer('tournament_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tournaments')
        .onDelete('RESTRICT')
      table
        .integer('home_entry_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tournament_entries')
        .onDelete('RESTRICT')
      table
        .integer('away_entry_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tournament_entries')
        .onDelete('RESTRICT')

      table.integer('round_number').unsigned().notNullable()
      table.dateTime('scheduled_at')
      table.integer('home_score').unsigned()
      table.integer('away_score').unsigned()
      table.string('status', 20).defaultTo('scheduled')

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
