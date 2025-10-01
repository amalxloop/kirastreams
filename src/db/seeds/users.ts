import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const now = new Date().toISOString();
    
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('Kira', 10);
    const userPasswordHash = await bcrypt.hash('password123', 10);

    const sampleUsers = [
        // Default admin user
        {
            email: 'kirathegoatofanime@gmail.com',
            passwordHash: adminPasswordHash,
            name: 'Kira Admin',
            role: 'admin',
            status: 'active',
            avatarUrl: null,
            createdAt: now,
            updatedAt: now,
        },
        // Regular users
        {
            email: 'john.doe@email.com',
            passwordHash: userPasswordHash,
            name: 'John Doe',
            role: 'user',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            createdAt: new Date('2024-07-15T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-07-15T10:30:00Z').toISOString(),
        },
        {
            email: 'sarah.wilson@gmail.com',
            passwordHash: userPasswordHash,
            name: 'Sarah Wilson',
            role: 'user',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
            createdAt: new Date('2024-08-02T14:20:00Z').toISOString(),
            updatedAt: new Date('2024-08-02T14:20:00Z').toISOString(),
        },
        {
            email: 'mike.johnson@email.com',
            passwordHash: userPasswordHash,
            name: 'Mike Johnson',
            role: 'user',
            status: 'banned',
            avatarUrl: null,
            createdAt: new Date('2024-08-18T09:45:00Z').toISOString(),
            updatedAt: new Date('2024-08-18T09:45:00Z').toISOString(),
        },
        {
            email: 'emily.davis@gmail.com',
            passwordHash: userPasswordHash,
            name: 'Emily Davis',
            role: 'user',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
            createdAt: new Date('2024-09-05T16:15:00Z').toISOString(),
            updatedAt: new Date('2024-09-05T16:15:00Z').toISOString(),
        },
        {
            email: 'alex.brown@email.com',
            passwordHash: userPasswordHash,
            name: 'Alex Brown',
            role: 'user',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            createdAt: new Date('2024-09-22T11:30:00Z').toISOString(),
            updatedAt: new Date('2024-09-22T11:30:00Z').toISOString(),
        },
        {
            email: 'lisa.garcia@gmail.com',
            passwordHash: userPasswordHash,
            name: 'Lisa Garcia',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date('2024-10-08T13:45:00Z').toISOString(),
            updatedAt: new Date('2024-10-08T13:45:00Z').toISOString(),
        },
        {
            email: 'david.miller@email.com',
            passwordHash: userPasswordHash,
            name: 'David Miller',
            role: 'user',
            status: 'banned',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            createdAt: new Date('2024-10-25T08:20:00Z').toISOString(),
            updatedAt: new Date('2024-10-25T08:20:00Z').toISOString(),
        },
        {
            email: 'anna.lopez@gmail.com',
            passwordHash: userPasswordHash,
            name: 'Anna Lopez',
            role: 'user',
            status: 'active',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            createdAt: new Date('2024-11-10T15:10:00Z').toISOString(),
            updatedAt: new Date('2024-11-10T15:10:00Z').toISOString(),
        },
        {
            email: 'james.taylor@email.com',
            passwordHash: userPasswordHash,
            name: 'James Taylor',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date('2024-11-28T12:00:00Z').toISOString(),
            updatedAt: new Date('2024-11-28T12:00:00Z').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});