import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Match from '#models/match'
import Tournament from '#models/tournament'
import TournamentEntry from '#models/tournament_entry'
import Team from '#models/team'

export default class extends BaseSeeder {
  async run() {
    const valorant = await Tournament.findByOrFail('name', 'La Ligue Valorant Championship')
    const rocket = await Tournament.findByOrFail('name', 'Rocket League Winter Cup')

    const teams = await Team.all()
    const entries = await TournamentEntry.all()

    const getEntry = (tournamentId: number, tag: string) => {
      const team = teams.find((item) => item.tag === tag)!
      return entries.find(
        (entry) => entry.tournamentId === tournamentId && entry.teamId === team.id
      )!.id
    }

    await Match.createMany([
      {
        tournamentId: valorant.id,
        homeEntryId: getEntry(valorant.id, 'PHM'),
        awayEntryId: getEntry(valorant.id, 'NOVA'),
        roundNumber: 1,
        scheduledAt: DateTime.fromISO('2027-02-10T18:00:00'),
        status: 'scheduled',
      },
      {
        tournamentId: valorant.id,
        homeEntryId: getEntry(valorant.id, 'SW'),
        awayEntryId: getEntry(valorant.id, 'TITAN'),
        roundNumber: 1,
        scheduledAt: DateTime.fromISO('2027-02-10T20:00:00'),
        status: 'scheduled',
      },
      {
        tournamentId: valorant.id,
        homeEntryId: getEntry(valorant.id, 'PHM'),
        awayEntryId: getEntry(valorant.id, 'SW'),
        roundNumber: 2,
        scheduledAt: DateTime.fromISO('2027-02-17T18:00:00'),
        status: 'scheduled',
      },
      {
        tournamentId: rocket.id,
        homeEntryId: getEntry(rocket.id, 'PHM'),
        awayEntryId: getEntry(rocket.id, 'NOVA'),
        roundNumber: 1,
        scheduledAt: DateTime.fromISO('2027-02-20T14:00:00'),
        status: 'scheduled',
      },
    ])
  }
}
