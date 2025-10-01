import { db } from '@/db';
import { admins } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const saltRounds = 10;
    
    const sampleAdmins = [
        {
            email: 'kirathegoatofanime@gmail.com',
            passwordHash: await bcrypt.hash('Kira', saltRounds),
            name: 'Kira Admin',
            role: 'admin',
            createdAt: new Date('2023-08-15').toISOString(),
            lastLoginAt: new Date('2024-01-20').toISOString(),
        },
        {
            email: 'admin1@kirastreams.com',
            passwordHash: await bcrypt.hash('admin123', saltRounds),
            name: 'Sarah Johnson',
            role: 'admin',
            createdAt: new Date('2023-09-10').toISOString(),
            lastLoginAt: new Date('2024-01-18').toISOString(),
        },
        {
            email: 'admin2@kirastreams.com',
            passwordHash: await bcrypt.hash('admin123', saltRounds),
            name: 'Michael Chen',
            role: 'admin',
            createdAt: new Date('2023-10-05').toISOString(),
            lastLoginAt: null,
        },
        {
            email: 'admin3@kirastreams.com',
            passwordHash: await bcrypt.hash('admin123', saltRounds),
            name: 'Emma Rodriguez',
            role: 'admin',
            createdAt: new Date('2023-11-20').toISOString(),
            lastLoginAt: new Date('2024-01-15').toISOString(),
        },
        {
            email: 'admin4@kirastreams.com',
            passwordHash: await bcrypt.hash('admin123', saltRounds),
            name: 'David Thompson',
            role: 'admin',
            createdAt: new Date('2023-12-08').toISOString(),
            lastLoginAt: null,
        }
    ];

    await db.insert(admins).values(sampleAdmins);
    
    console.log('✅ Admins seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});