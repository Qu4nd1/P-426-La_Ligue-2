import { TeamMemberSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import User from './user.ts'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Team from './team.ts'

export default class TeamMember extends TeamMemberSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>
}
