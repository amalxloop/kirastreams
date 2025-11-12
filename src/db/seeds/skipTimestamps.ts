import { db } from '@/db';
import { skipTimestamps } from '@/db/schema';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const sampleSkipTimestamps = [
        {
            contentId: 'tv_death_note',
            contentType: 'tv',
            introStart: 10,
            introEnd: 100,
            outroStart: 1290,
            outroEnd: 1380,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'movie_your_name',
            contentType: 'movie',
            introStart: 0,
            introEnd: 120,
            outroStart: null,
            outroEnd: null,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_naruto',
            contentType: 'tv',
            introStart: 30,
            introEnd: 120,
            outroStart: 1290,
            outroEnd: 1380,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_one_piece',
            contentType: 'tv',
            introStart: 45,
            introEnd: 135,
            outroStart: 1290,
            outroEnd: 1380,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_attack_on_titan',
            contentType: 'tv',
            introStart: 15,
            introEnd: 105,
            outroStart: 1350,
            outroEnd: 1440,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_demon_slayer',
            contentType: 'tv',
            introStart: 20,
            introEnd: 110,
            outroStart: 1350,
            outroEnd: 1440,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'movie_spirited_away',
            contentType: 'movie',
            introStart: null,
            introEnd: null,
            outroStart: 7350,
            outroEnd: 7440,
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_fullmetal_alchemist',
            contentType: 'tv',
            introStart: 25,
            introEnd: 115,
            outroStart: 1350,
            outroEnd: 1440,
            createdAt: currentTimestamp,
        }
    ];

    await db.insert(skipTimestamps).values(sampleSkipTimestamps);
    
    console.log('✅ Skip timestamps seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});