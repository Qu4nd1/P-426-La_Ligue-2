import Game from '#models/game'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Game.createMany([
      {
        name: 'Valorant',
        slug: 'valorant',
        imageUrl: null,
      },
      {
        name: 'Counter-Strike 2',
        slug: 'counter-strike-2',
        imageUrl: null,
      },
      {
        name: 'League of Legends',
        slug: 'league-of-legends',
        imageUrl: null,
      },
      {
        name: 'Rocket League',
        slug: 'rocket-league',
        imageUrl: null,
      },
      {
        name: 'Overwatch 2',
        slug: 'overwatch-2',
        imageUrl: null,
      },
    ])
  }
}
