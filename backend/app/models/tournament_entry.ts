import { TournamentEntrySchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tournament from './tournament.ts'
import Team from './team.ts'
import Match from './match.ts'

export default class TournamentEntry extends TournamentEntrySchema {
  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>

  @hasMany(() => Match, { foreignKey: 'homeEntryId' })
  declare homeMatches: HasMany<typeof Match>

  @hasMany(() => Match, { foreignKey: 'awayEntryId' })
  declare awayMatches: HasMany<typeof Match>
}
