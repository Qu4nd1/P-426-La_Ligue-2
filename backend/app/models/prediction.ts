import { PredictionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import User from './user.ts'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Match from './match.ts'

export default class Prediction extends PredictionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Match)
  declare match: BelongsTo<typeof Match>
}
