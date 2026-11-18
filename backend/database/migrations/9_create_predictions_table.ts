import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'predictions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // FK's
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('match_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('matches')
        .onDelete('CASCADE')
      table.unique(['user_id', 'match_id'])

      table.integer('predicted_home_score').unsigned().notNullable()
      table.integer('predicted_away_score').unsigned().notNullable()
      table.integer('points_earned').unsigned()

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
