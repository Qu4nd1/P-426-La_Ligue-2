import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Prediction from '#models/prediction'
import User from '#models/user'
import Match from '#models/match'

export default class extends BaseSeeder {
  async run() {
    const users = await User.all()
    const matches = await Match.query().orderBy('id', 'asc')

    const getUser = (email: string) => users.find((user) => user.email === email)!.id

    // Base de développement : 4 matchs créés par MatchSeeder
    if (matches.length !== 4) {
      throw new Error('Le seeder attend exactement 4 matchs')
    }

    await Prediction.createMany([
      {
        userId: getUser('alex@example.com'),
        matchId: matches[0].id,
        predictedHomeScore: 2,
        predictedAwayScore: 1,
      },
      {
        userId: getUser('sarah@example.com'),
        matchId: matches[0].id,
        predictedHomeScore: 2,
        predictedAwayScore: 0,
      },
      {
        userId: getUser('emma@example.com'),
        matchId: matches[1].id,
        predictedHomeScore: 1,
        predictedAwayScore: 2,
      },
      {
        userId: getUser('lucas@example.com'),
        matchId: matches[1].id,
        predictedHomeScore: 0,
        predictedAwayScore: 2,
      },
      {
        userId: getUser('nathan@example.com'),
        matchId: matches[2].id,
        predictedHomeScore: 2,
        predictedAwayScore: 0,
      },
      {
        userId: getUser('hugo@example.com'),
        matchId: matches[2].id,
        predictedHomeScore: 1,
        predictedAwayScore: 2,
      },
      {
        userId: getUser('leo@example.com'),
        matchId: matches[3].id,
        predictedHomeScore: 3,
        predictedAwayScore: 2,
      },
      {
        userId: getUser('chloe@example.com'),
        matchId: matches[3].id,
        predictedHomeScore: 2,
        predictedAwayScore: 3,
      },
    ])
  }
}
