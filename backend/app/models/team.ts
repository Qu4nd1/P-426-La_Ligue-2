import { TeamSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from './user.ts'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import TeamMember from './team_member.ts'
import TournamentEntry from './tournament_entry.ts'

export default class Team extends TeamSchema {
  @belongsTo(() => User, { foreignKey: 'captainId' })
  declare captain: BelongsTo<typeof User>

  @hasMany(() => TeamMember)
  declare teamMembers: HasMany<typeof TeamMember>

  @hasMany(() => TournamentEntry)
  declare tournamentEntries: HasMany<typeof TournamentEntry>
}
