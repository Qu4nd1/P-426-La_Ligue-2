import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'team_members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // FK's
      table
        .integer('team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.dateTime('joined_at').notNullable().defaultTo(this.now())
      table.dateTime('left_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
