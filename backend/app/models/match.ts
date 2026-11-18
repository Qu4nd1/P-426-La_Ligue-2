import { MatchSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Tournament from './tournament.ts'
import TournamentEntry from './tournament_entry.ts'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Prediction from './prediction.ts'

export default class Match extends MatchSchema {
  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @belongsTo(() => TournamentEntry, { foreignKey: 'homeEntryId' })
  declare homeEntry: BelongsTo<typeof TournamentEntry>

  @belongsTo(() => TournamentEntry, { foreignKey: 'awayEntryId' })
  declare awayEntry: BelongsTo<typeof TournamentEntry>

  @hasMany(() => Prediction)
  declare predictions: HasMany<typeof Prediction>
}
