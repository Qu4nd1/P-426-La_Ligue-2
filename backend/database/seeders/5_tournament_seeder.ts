import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Tournament from '#models/tournament'
import Game from '#models/game'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const valorant = await Game.findByOrFail('slug', 'valorant')
    const rocketLeague = await Game.findByOrFail('slug', 'rocket-league')
    const admin = await User.findByOrFail('email', 'alex@example.com')

    await Tournament.createMany([
      {
        name: 'La Ligue Valorant Championship',
        description: 'Championnat Valorant réunissant les meilleures équipes.',
        gameId: valorant.id,
        organizerId: admin.id,
        maxTeams: 8,
        status: 'ongoing',
        registrationDeadline: DateTime.fromISO('2027-01-31T23:59:00'),
        startsAt: DateTime.fromISO('2027-02-10T18:00:00'),
        endsAt: DateTime.fromISO('2027-03-10T22:00:00'),
      },
      {
        name: 'Rocket League Winter Cup',
        description: 'Tournoi Rocket League de la saison hivernale.',
        gameId: rocketLeague.id,
        organizerId: admin.id,
        maxTeams: 8,
        status: 'open',
        registrationDeadline: DateTime.fromISO('2027-02-15T23:59:00'),
        startsAt: DateTime.fromISO('2027-02-20T14:00:00'),
        endsAt: DateTime.fromISO('2027-02-21T20:00:00'),
      },
    ])
  }
}
