import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Team from '#models/team'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const lucas = await User.findByOrFail('email', 'lucas@example.com')
    const emma = await User.findByOrFail('email', 'emma@example.com')
    const hugo = await User.findByOrFail('email', 'hugo@example.com')
    const nathan = await User.findByOrFail('email', 'nathan@example.com')

    await Team.createMany([
      {
        name: 'Phantom Esports',
        tag: 'PHM',
        description: 'Équipe compétitive spécialisée dans les FPS.',
        captainId: lucas.id,
      },
      {
        name: 'Nova Gaming',
        tag: 'NOVA',
        description: 'Une équipe ambitieuse de joueurs passionnés.',
        captainId: emma.id,
      },
      {
        name: 'Shadow Wolves',
        tag: 'SW',
        description: 'Organisation e-sport tournée vers la compétition.',
        captainId: hugo.id,
      },
      {
        name: 'Titan Esports',
        tag: 'TITAN',
        description: 'Une structure compétitive multigaming.',
        captainId: nathan.id,
      },
    ])
  }
}
