import { db } from '@/db';
import { adminSettings } from '@/db/schema';

async function main() {
    const defaultSettings = [
        {
            platformName: 'KiraStreams',
            logoUrl: null,
            primaryColor: '#8b5cf6',
            cdnBaseUrl: null,
            watermarkEnabled: false,
            theme: 'dark',
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(adminSettings).values(defaultSettings);
    
    console.log('✅ Admin settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});