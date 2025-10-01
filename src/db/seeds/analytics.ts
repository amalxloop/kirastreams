import { db } from '@/db';
import { analytics } from '@/db/schema';

async function main() {
    const sampleAnalytics = [
        // Popular content (1, 3, 5) with more records
        // Content ID 1 - very popular
        { userId: 1, contentId: 1, watchDuration: 6420, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-08 20:15:00').toISOString() },
        { userId: 2, contentId: 1, watchDuration: 5850, completed: true, deviceType: 'mobile', createdAt: new Date('2024-12-08 14:30:00').toISOString() },
        { userId: 3, contentId: 1, watchDuration: 890, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-07 19:45:00').toISOString() },
        { userId: 4, contentId: 1, watchDuration: 6200, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-07 21:00:00').toISOString() },
        { userId: 5, contentId: 1, watchDuration: 3200, completed: false, deviceType: 'desktop', createdAt: new Date('2024-12-06 16:20:00').toISOString() },
        { userId: 6, contentId: 1, watchDuration: 5920, completed: true, deviceType: 'tablet', createdAt: new Date('2024-12-05 22:10:00').toISOString() },
        { userId: 7, contentId: 1, watchDuration: 1250, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-04 13:45:00').toISOString() },
        { userId: 8, contentId: 1, watchDuration: 6100, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-03 20:30:00').toISOString() },
        
        // Content ID 3 - popular
        { userId: 1, contentId: 3, watchDuration: 4890, completed: true, deviceType: 'mobile', createdAt: new Date('2024-12-08 15:20:00').toISOString() },
        { userId: 2, contentId: 3, watchDuration: 720, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-07 12:15:00').toISOString() },
        { userId: 4, contentId: 3, watchDuration: 4250, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-06 19:30:00').toISOString() },
        { userId: 9, contentId: 3, watchDuration: 1450, completed: false, deviceType: 'tablet', createdAt: new Date('2024-12-05 17:45:00').toISOString() },
        { userId: 10, contentId: 3, watchDuration: 4680, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-04 21:15:00').toISOString() },
        { userId: 3, contentId: 3, watchDuration: 2890, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-02 14:20:00').toISOString() },
        
        // Content ID 5 - popular
        { userId: 5, contentId: 5, watchDuration: 3650, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-08 18:40:00').toISOString() },
        { userId: 6, contentId: 5, watchDuration: 950, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-07 11:30:00').toISOString() },
        { userId: 7, contentId: 5, watchDuration: 3420, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-06 20:15:00').toISOString() },
        { userId: 8, contentId: 5, watchDuration: 1780, completed: false, deviceType: 'tablet', createdAt: new Date('2024-12-05 16:45:00').toISOString() },
        { userId: 9, contentId: 5, watchDuration: 3290, completed: true, deviceType: 'mobile', createdAt: new Date('2024-12-03 19:20:00').toISOString() },
        
        // Regular content with varied viewing patterns
        { userId: 1, contentId: 2, watchDuration: 580, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-08 08:15:00').toISOString() },
        { userId: 2, contentId: 4, watchDuration: 2450, completed: false, deviceType: 'desktop', createdAt: new Date('2024-12-07 20:30:00').toISOString() },
        { userId: 3, contentId: 6, watchDuration: 5200, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-06 21:45:00').toISOString() },
        { userId: 4, contentId: 7, watchDuration: 1320, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-05 13:20:00').toISOString() },
        { userId: 5, contentId: 8, watchDuration: 4850, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-04 19:15:00').toISOString() },
        { userId: 6, contentId: 9, watchDuration: 890, completed: false, deviceType: 'tablet', createdAt: new Date('2024-12-03 15:40:00').toISOString() },
        { userId: 7, contentId: 10, watchDuration: 3980, completed: true, deviceType: 'mobile', createdAt: new Date('2024-12-02 20:25:00').toISOString() },
        { userId: 8, contentId: 11, watchDuration: 1650, completed: false, deviceType: 'desktop', createdAt: new Date('2024-12-01 17:30:00').toISOString() },
        { userId: 9, contentId: 12, watchDuration: 5450, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-30 21:10:00').toISOString() },
        { userId: 10, contentId: 13, watchDuration: 720, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-29 12:45:00').toISOString() },
        
        // Multiple sessions for same users (realistic behavior)
        { userId: 1, contentId: 7, watchDuration: 2890, completed: false, deviceType: 'desktop', createdAt: new Date('2024-12-06 19:20:00').toISOString() },
        { userId: 1, contentId: 9, watchDuration: 4250, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-04 20:45:00').toISOString() },
        { userId: 2, contentId: 8, watchDuration: 1450, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-05 14:15:00').toISOString() },
        { userId: 2, contentId: 12, watchDuration: 3680, completed: true, deviceType: 'tablet', createdAt: new Date('2024-12-02 18:30:00').toISOString() },
        { userId: 3, contentId: 4, watchDuration: 950, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-04 11:20:00').toISOString() },
        { userId: 3, contentId: 11, watchDuration: 5120, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-01 19:40:00').toISOString() },
        
        // Weekend viewing (more activity)
        { userId: 4, contentId: 14, watchDuration: 6250, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-08 22:15:00').toISOString() },
        { userId: 5, contentId: 15, watchDuration: 4890, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-07 23:30:00').toISOString() },
        { userId: 6, contentId: 2, watchDuration: 1250, completed: false, deviceType: 'tablet', createdAt: new Date('2024-12-01 20:45:00').toISOString() },
        { userId: 7, contentId: 6, watchDuration: 5680, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-30 21:20:00').toISOString() },
        { userId: 8, contentId: 13, watchDuration: 890, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-24 14:15:00').toISOString() },
        { userId: 9, contentId: 14, watchDuration: 3420, completed: true, deviceType: 'desktop', createdAt: new Date('2024-11-23 19:30:00').toISOString() },
        { userId: 10, contentId: 15, watchDuration: 2150, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-22 16:45:00').toISOString() },
        
        // Evening viewing patterns
        { userId: 1, contentId: 11, watchDuration: 4680, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-03 21:15:00').toISOString() },
        { userId: 2, contentId: 10, watchDuration: 1850, completed: false, deviceType: 'tablet', createdAt: new Date('2024-12-01 20:30:00').toISOString() },
        { userId: 3, contentId: 8, watchDuration: 5250, completed: true, deviceType: 'desktop', createdAt: new Date('2024-11-29 19:45:00').toISOString() },
        { userId: 4, contentId: 9, watchDuration: 780, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-28 21:20:00').toISOString() },
        { userId: 5, contentId: 7, watchDuration: 3890, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-27 22:10:00').toISOString() },
        
        // Additional varied patterns
        { userId: 6, contentId: 4, watchDuration: 1450, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-26 13:15:00').toISOString() },
        { userId: 7, contentId: 13, watchDuration: 4250, completed: true, deviceType: 'desktop', createdAt: new Date('2024-11-25 18:40:00').toISOString() },
        { userId: 8, contentId: 15, watchDuration: 920, completed: false, deviceType: 'tablet', createdAt: new Date('2024-11-24 15:25:00').toISOString() },
        { userId: 9, contentId: 2, watchDuration: 5680, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-23 20:50:00').toISOString() },
        { userId: 10, contentId: 6, watchDuration: 2450, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-22 12:30:00').toISOString() },
        
        // Short viewing sessions (mobile users)
        { userId: 1, contentId: 12, watchDuration: 420, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-21 08:15:00').toISOString() },
        { userId: 3, contentId: 14, watchDuration: 650, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-20 09:30:00').toISOString() },
        { userId: 5, contentId: 10, watchDuration: 380, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-19 07:45:00').toISOString() },
        { userId: 7, contentId: 8, watchDuration: 720, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-18 10:20:00').toISOString() },
        { userId: 9, contentId: 6, watchDuration: 550, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-17 11:15:00').toISOString() },
        
        // Long viewing sessions (TV users)
        { userId: 2, contentId: 7, watchDuration: 6850, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-16 21:30:00').toISOString() },
        { userId: 4, contentId: 11, watchDuration: 7200, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-15 20:15:00').toISOString() },
        { userId: 6, contentId: 13, watchDuration: 6420, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-14 19:45:00').toISOString() },
        { userId: 8, contentId: 2, watchDuration: 5950, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-13 22:20:00').toISOString() },
        { userId: 10, contentId: 4, watchDuration: 6180, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-12 21:10:00').toISOString() },
        
        // Medium duration sessions (tablet/desktop)
        { userId: 1, contentId: 15, watchDuration: 2850, completed: false, deviceType: 'tablet', createdAt: new Date('2024-11-11 16:30:00').toISOString() },
        { userId: 3, contentId: 9, watchDuration: 3250, completed: true, deviceType: 'desktop', createdAt: new Date('2024-11-10 18:45:00').toISOString() },
        { userId: 5, contentId: 12, watchDuration: 2680, completed: false, deviceType: 'tablet', createdAt: new Date('2024-11-09 17:20:00').toISOString() },
        { userId: 7, contentId: 14, watchDuration: 3450, completed: true, deviceType: 'desktop', createdAt: new Date('2024-11-08 19:15:00').toISOString() },
        
        // Recent high activity
        { userId: 2, contentId: 6, watchDuration: 4250, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-08 16:45:00').toISOString() },
        { userId: 4, contentId: 12, watchDuration: 1850, completed: false, deviceType: 'mobile', createdAt: new Date('2024-12-08 12:20:00').toISOString() },
        { userId: 6, contentId: 8, watchDuration: 5420, completed: true, deviceType: 'tv', createdAt: new Date('2024-12-07 22:30:00').toISOString() },
        { userId: 8, contentId: 10, watchDuration: 920, completed: false, deviceType: 'tablet', createdAt: new Date('2024-12-07 10:15:00').toISOString() },
        { userId: 10, contentId: 14, watchDuration: 3680, completed: true, deviceType: 'desktop', createdAt: new Date('2024-12-06 18:50:00').toISOString() },
        
        // Additional diversity
        { userId: 1, contentId: 6, watchDuration: 1250, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-07 14:30:00').toISOString() },
        { userId: 3, contentId: 15, watchDuration: 4890, completed: true, deviceType: 'tv', createdAt: new Date('2024-11-06 20:45:00').toISOString() },
        { userId: 5, contentId: 13, watchDuration: 780, completed: false, deviceType: 'tablet', createdAt: new Date('2024-11-05 11:20:00').toISOString() },
        { userId: 7, contentId: 2, watchDuration: 5680, completed: true, deviceType: 'desktop', createdAt: new Date('2024-11-04 19:30:00').toISOString() },
        { userId: 9, contentId: 11, watchDuration: 2150, completed: false, deviceType: 'mobile', createdAt: new Date('2024-11-03 15:15:00').toISOString() }
    ];

    await db.insert(analytics).values(sampleAnalytics);
    
    console.log('✅ Analytics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});