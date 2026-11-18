import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import TournamentEntry from '#models/tournament_entry'
import Tournament from '#models/tournament'
import Team from '#models/team'

export default class extends BaseSeeder {
  async run() {
    const valorant = await Tournament.findByOrFail('name', 'La Ligue Valorant Championship')
    const rocket = await Tournament.findByOrFail('name', 'Rocket League Winter Cup')

    const teams = await Team.all()
    const getTeam = (tag: string) => teams.find((team) => team.tag === tag)!.id

    const registeredAt = DateTime.fromISO('2027-01-15T10:00:00')

    await TournamentEntry.createMany([
      {
        tournamentId: valorant.id,
        teamId: getTeam('PHM'),
        status: 'accepted',
        registeredAt,
      },
      {
        tournamentId: valorant.id,
        teamId: getTeam('NOVA'),
        status: 'accepted',
        registeredAt,
      },
      {
        tournamentId: valorant.id,
        teamId: getTeam('SW'),
        status: 'accepted',
        registeredAt,
      },
      {
        tournamentId: valorant.id,
        teamId: getTeam('TITAN'),
        status: 'accepted',
        registeredAt,
      },
      {
        tournamentId: rocket.id,
        teamId: getTeam('PHM'),
        status: 'accepted',
        registeredAt,
      },
      {
        tournamentId: rocket.id,
        teamId: getTeam('NOVA'),
        status: 'accepted',
        registeredAt,
      },
    ])
  }
}
