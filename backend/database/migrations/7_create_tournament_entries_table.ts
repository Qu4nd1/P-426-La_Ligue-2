import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournament_entries'

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
        .integer('team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('RESTRICT')
      table.unique(['tournament_id', 'team_id']) // same two values can't appear twice

      table.string('status', 20).defaultTo('pending')
      table.dateTime('registered_at').notNullable().defaultTo(this.now())

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
