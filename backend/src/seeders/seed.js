const bcrypt = require('bcryptjs');
const { sequelize, User, Store, Rating } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('Database connected. Dropping and synchronizing tables...');

    // Recreate tables with schema constraints and clean state
    await sequelize.sync({ force: true });
    console.log('Tables synchronized successfully.');

    console.log('Hashing passwords...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@1234', salt);
    const ownerPasswordHash = await bcrypt.hash('Owner@1234', salt);
    const userPasswordHash = await bcrypt.hash('User@1234', salt);

    console.log('Creating users...');
    // 1 System Admin
    const admin = await User.create({
      name: 'System Administrator Account', // 30 chars
      email: 'admin@example.com',
      password_hash: adminPasswordHash,
      address: '742 Evergreen Terrace, Suite 100, Springfield, IL 62704',
      role: 'SYSTEM_ADMIN',
    });

    // 2 Store Owners
    const owner1 = await User.create({
      name: 'Alexander Wright Store Owner', // 28 chars
      email: 'alex.owner@example.com',
      password_hash: ownerPasswordHash,
      address: '1200 Grand Avenue, Financial District, New York, NY 10001',
      role: 'STORE_OWNER',
    });

    const owner2 = await User.create({
      name: 'Beatrice Vance Store Owner', // 26 chars
      email: 'beatrice.owner@example.com',
      password_hash: ownerPasswordHash,
      address: '450 Artisan Way, Market Square, San Francisco, CA 94103',
      role: 'STORE_OWNER',
    });

    // 1 Unassigned Store Owner for testing admin assignment
    const owner3 = await User.create({
      name: 'Daniel Morgan Store Owner', // 25 chars
      email: 'daniel.owner@example.com',
      password_hash: ownerPasswordHash,
      address: '78 Pinecrest Boulevard, Seattle, WA 98101',
      role: 'STORE_OWNER',
    });

    // 3 Normal Users
    const user1 = await User.create({
      name: 'Christopher Robin Reviewer', // 26 chars
      email: 'christopher@example.com',
      password_hash: userPasswordHash,
      address: '12 Hundred Acre Wood Lane, Suite 4, Portland, OR 97201',
      role: 'NORMAL_USER',
    });

    const user2 = await User.create({
      name: 'Dorothy Gale Customer User', // 26 chars
      email: 'dorothy@example.com',
      password_hash: userPasswordHash,
      address: '42 Yellow Brick Road, Kansas City, KS 66101',
      role: 'NORMAL_USER',
    });

    const user3 = await User.create({
      name: 'Eleanor Vance Customer User', // 27 chars
      email: 'eleanor@example.com',
      password_hash: userPasswordHash,
      address: '880 Hillcrest Heights, Apt 12B, Chicago, IL 60611',
      role: 'NORMAL_USER',
    });

    console.log('Creating stores...');
    const store1 = await Store.create({
      name: 'Apex Electronics & Gadgets Hub', // 30 chars
      email: 'contact@apexelectronics.com',
      address: '100 Technology Way, Silicon Alley, New York, NY 10001',
      owner_id: owner1.id,
    });

    const store2 = await Store.create({
      name: 'Harvest Organic Grocery Market', // 30 chars
      email: 'info@harvestorganicmarket.com',
      address: '500 Organic Way, Farmers Plaza, San Francisco, CA 94103',
      owner_id: owner2.id,
    });

    const store3 = await Store.create({
      name: 'Metropolis Books & Cafe Lounge', // 30 chars
      email: 'hello@metropolisbooks.com',
      address: '300 Literary Lane, Cultural District, Boston, MA 02116',
      owner_id: null, // Unassigned store
    });

    console.log('Creating ratings...');
    await Rating.bulkCreate([
      {
        user_id: user1.id,
        store_id: store1.id,
        rating: 5,
      },
      {
        user_id: user2.id,
        store_id: store1.id,
        rating: 4,
      },
      {
        user_id: user3.id,
        store_id: store1.id,
        rating: 4,
      },
      {
        user_id: user1.id,
        store_id: store2.id,
        rating: 5,
      },
      {
        user_id: user2.id,
        store_id: store2.id,
        rating: 3,
      },
      {
        user_id: user3.id,
        store_id: store3.id,
        rating: 4,
      },
    ]);

    console.log('\n=============================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: Admin@1234');
    console.log('  Role:     SYSTEM_ADMIN\n');
    console.log('Store Owners:');
    console.log('  Owner 1:  alex.owner@example.com / Owner@1234 (Apex Electronics)');
    console.log('  Owner 2:  beatrice.owner@example.com / Owner@1234 (Harvest Organic)');
    console.log('  Owner 3:  daniel.owner@example.com / Owner@1234 (Unassigned)');
    console.log('\nNormal Users:');
    console.log('  User 1:   christopher@example.com / User@1234');
    console.log('  User 2:   dorothy@example.com / User@1234');
    console.log('  User 3:   eleanor@example.com / User@1234');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
