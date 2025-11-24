import { db } from '@/db';
import { admins } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = await bcrypt.hash('Kira', 10);
    
    const adminData = {
        email: 'kirathegoatofanime@gmail.com',
        passwordHash: hashedPassword,
        name: 'Kira Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
    };

    await db.insert(admins).values(adminData);
    
    console.log('✅ Admins seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});