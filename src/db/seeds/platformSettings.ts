import { db } from '@/db';
import { platformSettings } from '@/db/schema';

async function main() {
    const sampleSettings = [
        {
            key: 'platform_name',
            value: 'KiraStreams',
            category: 'branding',
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            key: 'logo_url',
            value: 'https://kirastreams.com/logo.png',
            category: 'branding',
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            key: 'favicon_url',
            value: 'https://kirastreams.com/favicon.ico',
            category: 'branding',
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            key: 'brand_color',
            value: '#8B5CF6',
            category: 'branding',
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            key: 'secondary_color',
            value: '#10B981',
            category: 'branding',
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            key: 'max_concurrent_streams',
            value: 3,
            category: 'config',
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            key: 'cdn_base_url',
            value: 'https://cdn.kirastreams.com',
            category: 'config',
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            key: 'api_version',
            value: '1.0',
            category: 'config',
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            key: 'maintenance_mode',
            value: false,
            category: 'config',
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            key: 'user_registration_enabled',
            value: true,
            category: 'config',
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            key: 'email_verification_required',
            value: true,
            category: 'config',
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            key: 'primary_theme',
            value: 'dark',
            category: 'theme',
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            key: 'accent_color',
            value: '#8B5CF6',
            category: 'theme',
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            key: 'background_color',
            value: '#111827',
            category: 'theme',
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            key: 'text_color',
            value: '#F9FAFB',
            category: 'theme',
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            key: 'sidebar_color',
            value: '#1F2937',
            category: 'theme',
            updatedAt: new Date('2024-01-25').toISOString(),
        }
    ];

    await db.insert(platformSettings).values(sampleSettings);
    
    console.log('✅ Platform settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});