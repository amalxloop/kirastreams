import { db } from '@/db';
import { contentThemes } from '@/db/schema';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const sampleThemes = [
        {
            contentId: 'tv_death_note',
            contentType: 'tv',
            themeName: 'Dark Justice',
            primaryColor: '#1a0000',
            secondaryColor: '#000000',
            accentColor: '#8b0000',
            gradientFrom: '#1a0000',
            gradientTo: '#000000',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'movie_your_name',
            contentType: 'movie',
            themeName: 'Twilight Sky',
            primaryColor: '#87ceeb',
            secondaryColor: '#ffb6c1',
            accentColor: '#ffd700',
            gradientFrom: '#87ceeb',
            gradientTo: '#ffb6c1',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_attack_on_titan',
            contentType: 'tv',
            themeName: 'Survey Corps',
            primaryColor: '#2d5016',
            secondaryColor: '#4a3728',
            accentColor: '#8b7355',
            gradientFrom: '#2d5016',
            gradientTo: '#4a3728',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_demon_slayer',
            contentType: 'tv',
            themeName: 'Breath of Water',
            primaryColor: '#9b59b6',
            secondaryColor: '#e91e63',
            accentColor: '#00bcd4',
            gradientFrom: '#9b59b6',
            gradientTo: '#e91e63',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_naruto',
            contentType: 'tv',
            themeName: 'Nine Tails',
            primaryColor: '#ff8c00',
            secondaryColor: '#1e3a8a',
            accentColor: '#ffd700',
            gradientFrom: '#ff8c00',
            gradientTo: '#ffd700',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_one_piece',
            contentType: 'tv',
            themeName: 'Straw Hat Adventure',
            primaryColor: '#dc143c',
            secondaryColor: '#1e90ff',
            accentColor: '#ffd700',
            gradientFrom: '#dc143c',
            gradientTo: '#ffd700',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'movie_spirited_away',
            contentType: 'movie',
            themeName: 'Spirit Realm',
            primaryColor: '#6a0dad',
            secondaryColor: '#008080',
            accentColor: '#ff69b4',
            gradientFrom: '#6a0dad',
            gradientTo: '#008080',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_my_hero_academia',
            contentType: 'tv',
            themeName: 'Plus Ultra',
            primaryColor: '#2ecc71',
            secondaryColor: '#e74c3c',
            accentColor: '#f39c12',
            gradientFrom: '#2ecc71',
            gradientTo: '#f39c12',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'tv_fullmetal_alchemist',
            contentType: 'tv',
            themeName: 'Equivalent Exchange',
            primaryColor: '#c0392b',
            secondaryColor: '#34495e',
            accentColor: '#f1c40f',
            gradientFrom: '#c0392b',
            gradientTo: '#34495e',
            createdAt: currentTimestamp,
        },
        {
            contentId: 'movie_weathering_with_you',
            contentType: 'movie',
            themeName: 'Sunshine Girl',
            primaryColor: '#3498db',
            secondaryColor: '#ecf0f1',
            accentColor: '#f39c12',
            gradientFrom: '#3498db',
            gradientTo: '#f39c12',
            createdAt: currentTimestamp,
        },
    ];

    await db.insert(contentThemes).values(sampleThemes);
    
    console.log('✅ Content themes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});