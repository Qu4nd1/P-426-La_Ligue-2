import { TournamentSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Game from './game.ts'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.ts'
import TournamentEntry from './tournament_entry.ts'
import Match from './match.ts'

export default class Tournament extends TournamentSchema {
  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User, { foreignKey: 'organizerId' })
  declare organizer: BelongsTo<typeof User>

  @hasMany(() => TournamentEntry)
  declare tournamentEntries: HasMany<typeof TournamentEntry>

  @hasMany(() => Match)
  declare matches: HasMany<typeof Match>
}
