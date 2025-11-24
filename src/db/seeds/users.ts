import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    // Clear existing users data
    await db.delete(users);

    const now = Date.now();
    const daysInMs = 24 * 60 * 60 * 1000;

    // Hash the password once for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const sampleUsers = [
        {
            email: 'user1@test.com',
            passwordHash: hashedPassword,
            name: 'Test User 1',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date(now - 25 * daysInMs).toISOString(),
            updatedAt: new Date(now - 25 * daysInMs).toISOString(),
        },
        {
            email: 'user2@test.com',
            passwordHash: hashedPassword,
            name: 'Test User 2',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date(now - 20 * daysInMs).toISOString(),
            updatedAt: new Date(now - 20 * daysInMs).toISOString(),
        },
        {
            email: 'user3@test.com',
            passwordHash: hashedPassword,
            name: 'Test User 3',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date(now - 15 * daysInMs).toISOString(),
            updatedAt: new Date(now - 15 * daysInMs).toISOString(),
        },
        {
            email: 'user4@test.com',
            passwordHash: hashedPassword,
            name: 'Test User 4',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date(now - 10 * daysInMs).toISOString(),
            updatedAt: new Date(now - 10 * daysInMs).toISOString(),
        },
        {
            email: 'user5@test.com',
            passwordHash: hashedPassword,
            name: 'Test User 5',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date(now - 5 * daysInMs).toISOString(),
            updatedAt: new Date(now - 5 * daysInMs).toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});