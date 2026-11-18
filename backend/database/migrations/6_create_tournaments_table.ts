import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 150).notNullable()
      table.text('description')

      // FK's
      table
        .integer('game_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('games')
        .onDelete('RESTRICT')
      table
        .integer('organizer_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      table.integer('max_teams').unsigned().notNullable()
      table.string('status', 20).defaultTo('draft')
      table.dateTime('registration_deadline')
      table.dateTime('starts_at').notNullable()
      table.dateTime('ends_at')

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
