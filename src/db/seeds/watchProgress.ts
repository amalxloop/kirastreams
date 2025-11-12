import { db } from '@/db';
import { watchProgress } from '@/db/schema';

async function main() {
    const now = Math.floor(Date.now() / 1000);
    
    const sampleWatchProgress = [
        {
            userId: 'user_1',
            contentId: 'movie_black_panther',
            contentType: 'movie',
            progressSeconds: 2010,
            totalSeconds: 8040,
            lastWatchedAt: now - 7200,
            createdAt: now - 7200,
            updatedAt: now - 7200,
        },
        {
            userId: 'user_1',
            contentId: 'movie_john_wick',
            contentType: 'movie',
            progressSeconds: 4848,
            totalSeconds: 6060,
            lastWatchedAt: now - 18000,
            createdAt: now - 18000,
            updatedAt: now - 18000,
        },
        {
            userId: 'user_2',
            contentId: 'tv_breaking_bad',
            contentType: 'tv',
            progressSeconds: 1500,
            totalSeconds: 2820,
            lastWatchedAt: now - 3600,
            createdAt: now - 3600,
            updatedAt: now - 3600,
        },
        {
            userId: 'user_2',
            contentId: 'movie_mad_max',
            contentType: 'movie',
            progressSeconds: 720,
            totalSeconds: 7200,
            lastWatchedAt: now - 259200,
            createdAt: now - 259200,
            updatedAt: now - 259200,
        },
        {
            userId: 'user_3',
            contentId: 'tv_stranger_things',
            contentType: 'tv',
            progressSeconds: 2142,
            totalSeconds: 3060,
            lastWatchedAt: now - 21600,
            createdAt: now - 21600,
            updatedAt: now - 21600,
        },
        {
            userId: 'user_3',
            contentId: 'movie_shawshank',
            contentType: 'movie',
            progressSeconds: 1800,
            totalSeconds: 8520,
            lastWatchedAt: now - 43200,
            createdAt: now - 43200,
            updatedAt: now - 43200,
        },
        {
            userId: 'user_4',
            contentId: 'tv_crown',
            contentType: 'tv',
            progressSeconds: 3132,
            totalSeconds: 3480,
            lastWatchedAt: now - 1800,
            createdAt: now - 1800,
            updatedAt: now - 1800,
        },
        {
            userId: 'user_5',
            contentId: 'movie_forrest_gump',
            contentType: 'movie',
            progressSeconds: 4260,
            totalSeconds: 8520,
            lastWatchedAt: now - 172800,
            createdAt: now - 172800,
            updatedAt: now - 172800,
        },
        {
            userId: 'user_6',
            contentId: 'tv_office',
            contentType: 'tv',
            progressSeconds: 900,
            totalSeconds: 1320,
            lastWatchedAt: now - 14400,
            createdAt: now - 14400,
            updatedAt: now - 14400,
        },
        {
            userId: 'user_7',
            contentId: 'movie_blade_runner',
            contentType: 'movie',
            progressSeconds: 6396,
            totalSeconds: 9840,
            lastWatchedAt: now - 28800,
            createdAt: now - 28800,
            updatedAt: now - 28800,
        },
    ];

    await db.insert(watchProgress).values(sampleWatchProgress);
    
    console.log('✅ Watch progress seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});