import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { hasMany } from '@adonisjs/lucid/orm'
import Team from './team.ts'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Tournament from './tournament.ts'
import Prediction from './prediction.ts'
import TeamMember from './team_member.ts'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  @hasMany(() => Team, { foreignKey: 'captainId,' })
  declare teams: HasMany<typeof Team>

  @hasMany(() => TeamMember)
  declare teamMembers: HasMany<typeof TeamMember>

  @hasMany(() => Tournament, { foreignKey: 'organizerId' })
  declare tournaments: HasMany<typeof Tournament>

  @hasMany(() => Prediction)
  declare predictions: HasMany<typeof Prediction>
}
