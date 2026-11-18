import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Team from '#models/team'
import User from '#models/user'
import TeamMember from '#models/team_member'

export default class extends BaseSeeder {
  async run() {
    const users = await User.all()
    const teams = await Team.all()

    const getUser = (email: string) => users.find((user) => user.email === email)!.id

    const getTeam = (tag: string) => teams.find((team) => team.tag === tag)!.id

    const joinedAt = DateTime.fromISO('2027-01-10T12:00:00')

    await TeamMember.createMany([
      { teamId: getTeam('PHM'), userId: getUser('lucas@example.com'), joinedAt },
      { teamId: getTeam('PHM'), userId: getUser('sarah@example.com'), joinedAt },
      { teamId: getTeam('PHM'), userId: getUser('enzo@example.com'), joinedAt },

      { teamId: getTeam('NOVA'), userId: getUser('emma@example.com'), joinedAt },
      { teamId: getTeam('NOVA'), userId: getUser('leo@example.com'), joinedAt },

      { teamId: getTeam('SW'), userId: getUser('hugo@example.com'), joinedAt },
      { teamId: getTeam('SW'), userId: getUser('chloe@example.com'), joinedAt },

      { teamId: getTeam('TITAN'), userId: getUser('nathan@example.com'), joinedAt },
      { teamId: getTeam('TITAN'), userId: getUser('maxime@example.com'), joinedAt },
      { teamId: getTeam('TITAN'), userId: getUser('alex@example.com'), joinedAt },
    ])
  }
}
