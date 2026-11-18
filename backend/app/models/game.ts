import { GameSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import Tournament from './tournament.ts'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Game extends GameSchema {
  @hasMany(() => Tournament)
  declare tournaments: HasMany<typeof Tournament>
}
