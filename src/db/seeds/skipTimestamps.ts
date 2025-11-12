import { db } from '@/db';
import { skipTimestamps } from '@/db/schema';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Clear existing data first
    await db.delete(skipTimestamps);
    console.log('✓ Cleared existing skip timestamps');
    
    const sampleSkipTimestamps = [
        // Movie: Moana 2 (ID: 1062722) - Currently watching
        {
            contentId: '1062722',
            contentType: 'movie',
            introStart: 10,
            introEnd: 85,
            outroStart: 5820, // ~1h 37m (credits start)
            outroEnd: 6120,
            createdAt: currentTimestamp,
        },
        // Movie: Red One (ID: 912649)
        {
            contentId: '912649',
            contentType: 'movie',
            introStart: 5,
            introEnd: 72,
            outroStart: 6900,
            outroEnd: 7200,
            createdAt: currentTimestamp,
        },
        // Movie: Venom: The Last Dance (ID: 1084736)
        {
            contentId: '1084736',
            contentType: 'movie',
            introStart: 8,
            introEnd: 65,
            outroStart: 6480,
            outroEnd: 6780,
            createdAt: currentTimestamp,
        },
        // Movie: Wicked (ID: 402431)
        {
            contentId: '402431',
            contentType: 'movie',
            introStart: 12,
            introEnd: 90,
            outroStart: 9600,
            outroEnd: 9900,
            createdAt: currentTimestamp,
        },
        // Movie: Gladiator II (ID: 558449)
        {
            contentId: '558449',
            contentType: 'movie',
            introStart: 15,
            introEnd: 88,
            outroStart: 8700,
            outroEnd: 9000,
            createdAt: currentTimestamp,
        },
        // TV: The Penguin (ID: 194764)
        {
            contentId: '194764',
            contentType: 'tv',
            introStart: 30,
            introEnd: 120,
            outroStart: 3240,
            outroEnd: 3480,
            createdAt: currentTimestamp,
        },
        // TV: Arcane (ID: 94605)
        {
            contentId: '94605',
            contentType: 'tv',
            introStart: 15,
            introEnd: 95,
            outroStart: 2400,
            outroEnd: 2640,
            createdAt: currentTimestamp,
        },
        // TV: Agatha All Along (ID: 138501)
        {
            contentId: '138501',
            contentType: 'tv',
            introStart: 20,
            introEnd: 110,
            outroStart: 2700,
            outroEnd: 2940,
            createdAt: currentTimestamp,
        },
    ];

    await db.insert(skipTimestamps).values(sampleSkipTimestamps);
    
    console.log(`✅ Inserted ${sampleSkipTimestamps.length} skip timestamp records`);
    console.log('✅ Skip timestamps seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});