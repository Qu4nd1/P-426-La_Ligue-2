import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    await User.createMany([
      {
        fullName: 'Alex Martin',
        username: 'Alex',
        email: 'alex@example.com',
        password: 'Test1234!',
        role: 'admin',
      },
      {
        fullName: 'Lucas Bernard',
        username: 'LuKa',
        email: 'lucas@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Emma Dubois',
        username: 'Emmy',
        email: 'emma@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Hugo Laurent',
        username: 'Hugz',
        email: 'hugo@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Nathan Morel',
        username: 'Nate',
        email: 'nathan@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Sarah Petit',
        username: 'Sary',
        email: 'sarah@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Enzo Robert',
        username: 'Enz',
        email: 'enzo@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Léo Garcia',
        username: 'LeoX',
        email: 'leo@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Chloé Richard',
        username: 'Chloe',
        email: 'chloe@example.com',
        password: 'Test1234!',
        role: 'user',
      },
      {
        fullName: 'Maxime Thomas',
        username: 'Max',
        email: 'maxime@example.com',
        password: 'Test1234!',
        role: 'user',
      },
    ])
  }
}
