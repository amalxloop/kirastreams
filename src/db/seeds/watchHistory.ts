import { db } from '@/db';
import { watchHistory } from '@/db/schema';

async function main() {
    // Delete all existing watch history records
    await db.delete(watchHistory);

    const now = Math.floor(Date.now() / 1000);

    const sampleWatchHistory = [
        // Movies (12 records)
        {
            userId: 'user',
            contentId: '550',
            contentType: 'movie',
            title: 'Fight Club',
            posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
            totalSeconds: 8280,
            progressSeconds: 8280,
            watchedAt: now - 7200, // now - 2 hours
        },
        {
            userId: 'user',
            contentId: '603',
            contentType: 'movie',
            title: 'The Matrix',
            posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
            totalSeconds: 8160,
            progressSeconds: 5400,
            watchedAt: now - 28800, // now - 8 hours
        },
        {
            userId: 'user',
            contentId: '13',
            contentType: 'movie',
            title: 'Forrest Gump',
            posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
            totalSeconds: 8520,
            progressSeconds: 8520,
            watchedAt: now - 97200, // now - 1 day - 3 hours
        },
        {
            userId: 'user',
            contentId: '155',
            contentType: 'movie',
            title: 'The Dark Knight',
            posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            totalSeconds: 9120,
            progressSeconds: 9120,
            watchedAt: now - 122400, // now - 1 day - 10 hours
        },
        {
            userId: 'user',
            contentId: '238',
            contentType: 'movie',
            title: 'The Godfather',
            posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
            totalSeconds: 10500,
            progressSeconds: 3200,
            watchedAt: now - 190800, // now - 2 days - 5 hours
        },
        {
            userId: 'user',
            contentId: '424',
            contentType: 'movie',
            title: "Schindler's List",
            posterPath: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
            totalSeconds: 11700,
            progressSeconds: 11700,
            watchedAt: now - 223200, // now - 2 days - 14 hours
        },
        {
            userId: 'user',
            contentId: '278',
            contentType: 'movie',
            title: 'The Shawshank Redemption',
            posterPath: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
            totalSeconds: 8520,
            progressSeconds: 8520,
            watchedAt: now - 280800, // now - 3 days - 6 hours
        },
        {
            userId: 'user',
            contentId: '680',
            contentType: 'movie',
            title: 'Pulp Fiction',
            posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
            totalSeconds: 9240,
            progressSeconds: 6800,
            watchedAt: now - 302400, // now - 3 days - 12 hours
        },
        {
            userId: 'user',
            contentId: '429',
            contentType: 'movie',
            title: 'The Good, the Bad and the Ugly',
            posterPath: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg',
            totalSeconds: 10200,
            progressSeconds: 4500,
            watchedAt: now - 374400, // now - 4 days - 8 hours
        },
        {
            userId: 'user',
            contentId: '19404',
            contentType: 'movie',
            title: 'Dilwale Dulhania Le Jayenge',
            posterPath: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
            totalSeconds: 11100,
            progressSeconds: 11100,
            watchedAt: now - 439200, // now - 5 days - 2 hours
        },
        {
            userId: 'user',
            contentId: '372058',
            contentType: 'movie',
            title: 'Your Name',
            posterPath: '/q719jXXEzOoYaps6babgKnONONX.jpg',
            totalSeconds: 6480,
            progressSeconds: 6480,
            watchedAt: now - 496800, // now - 5 days - 18 hours
        },
        {
            userId: 'user',
            contentId: '129',
            contentType: 'movie',
            title: 'Spirited Away',
            posterPath: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
            totalSeconds: 7500,
            progressSeconds: 2100,
            watchedAt: now - 532800, // now - 6 days - 4 hours
        },
        // TV Shows (8 records)
        {
            userId: 'user',
            contentId: '1396',
            contentType: 'tv',
            title: 'Breaking Bad',
            posterPath: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
            totalSeconds: 2820,
            progressSeconds: 2820,
            watchedAt: now - 14400, // now - 4 hours
        },
        {
            userId: 'user',
            contentId: '1399',
            contentType: 'tv',
            title: 'Game of Thrones',
            posterPath: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
            totalSeconds: 3420,
            progressSeconds: 3420,
            watchedAt: now - 54000, // now - 15 hours
        },
        {
            userId: 'user',
            contentId: '60574',
            contentType: 'tv',
            title: 'Peaky Blinders',
            posterPath: '/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg',
            totalSeconds: 3600,
            progressSeconds: 1800,
            watchedAt: now - 111600, // now - 1 day - 7 hours
        },
        {
            userId: 'user',
            contentId: '94605',
            contentType: 'tv',
            title: 'Arcane',
            posterPath: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
            totalSeconds: 2400,
            progressSeconds: 2400,
            watchedAt: now - 205200, // now - 2 days - 9 hours
        },
        {
            userId: 'user',
            contentId: '85271',
            contentType: 'tv',
            title: 'WandaVision',
            posterPath: '/glKDfE6btIRcVB5zrjspRIs4r52.jpg',
            totalSeconds: 1980,
            progressSeconds: 1980,
            watchedAt: now - 316800, // now - 3 days - 16 hours
        },
        {
            userId: 'user',
            contentId: '1668',
            contentType: 'tv',
            title: 'Friends',
            posterPath: '/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
            totalSeconds: 1320,
            progressSeconds: 1320,
            watchedAt: now - 385200, // now - 4 days - 11 hours
        },
        {
            userId: 'user',
            contentId: '46952',
            contentType: 'tv',
            title: 'The Witcher',
            posterPath: '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
            totalSeconds: 3600,
            progressSeconds: 2700,
            watchedAt: now - 482400, // now - 5 days - 14 hours
        },
        {
            userId: 'user',
            contentId: '82856',
            contentType: 'tv',
            title: 'The Mandalorian',
            posterPath: '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
            totalSeconds: 2400,
            progressSeconds: 2400,
            watchedAt: now - 590400, // now - 6 days - 20 hours
        },
    ];

    await db.insert(watchHistory).values(sampleWatchHistory);

    console.log('✅ Watch history seeder completed successfully - 20 records inserted');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});