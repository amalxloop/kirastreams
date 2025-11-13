import { db } from "@/db";
import { watchHistory } from "@/db/schema";

async function main() {
  // Clear existing data
  await db.delete(watchHistory);

  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  // Popular movies and TV shows with realistic data
  const content = [
    { id: "1062722", type: "movie", title: "Moana 2", poster: "/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg", duration: 6200 },
    { id: "558449", type: "movie", title: "Gladiator II", poster: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg", duration: 8400 },
    { id: "912649", type: "movie", title: "Venom: The Last Dance", poster: "/aosm8NMQ3UyoBVpSxyimorCQykC.jpg", duration: 6600 },
    { id: "1100782", type: "movie", title: "Smile 2", poster: "/aE85MnPIsSoSs3978Noo16BRsKN.jpg", duration: 7800 },
    { id: "402431", type: "movie", title: "Wicked", poster: "/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg", duration: 9600 },
    { id: "974453", type: "movie", title: "Absolution", poster: "/cNtAslrDhk1i3IOZ16vF7df6lMy.jpg", duration: 6720 },
    { id: "1184918", type: "movie", title: "The Wild Robot", poster: "/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg", duration: 6120 },
    { id: "945961", type: "movie", title: "Alien: Romulus", poster: "/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg", duration: 7080 },
    { id: "126801", type: "tv", title: "The Penguin", poster: "/9GRT6yxYvqos3n370QqgXTyZbTL.jpg", duration: 3600 },
    { id: "94605", type: "tv", title: "Arcane", poster: "/6H2U3bbWhw8Pbt4cGEhg8lTGZiK.jpg", duration: 2400 },
    { id: "138501", type: "tv", title: "Agatha All Along", poster: "/1C3Z2QjAfqjXYZDppM08v7qcGFP.jpg", duration: 2700 },
    { id: "37854", type: "tv", title: "One Piece", poster: "/4RnUXDWBj9nMJBhKPZULwL5XGTR.jpg", duration: 1440 },
  ];

  // User IDs matching the seeded users plus guest user
  const userIds = ["user1@test.com", "user2@test.com", "user3@test.com", "user4@test.com", "user5@test.com", "user"];

  const watchHistoryData = [];

  // Generate watch history for the last 7 days with varied data
  for (let day = 0; day < 7; day++) {
    const dayTimestamp = now - (day * dayInMs);
    
    // Each day, multiple users watch multiple items
    const itemsPerDay = 5 + Math.floor(Math.random() * 5); // 5-9 items per day
    
    for (let i = 0; i < itemsPerDay; i++) {
      const randomContent = content[Math.floor(Math.random() * content.length)];
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const watchPercentage = 0.3 + Math.random() * 0.6; // 30-90% watched
      const progressSeconds = Math.floor(randomContent.duration * watchPercentage);
      
      // Add some time variation within the day (random hour)
      const hourOffset = Math.floor(Math.random() * 24) * 60 * 60 * 1000;
      
      watchHistoryData.push({
        userId: randomUserId,
        contentId: randomContent.id,
        contentType: randomContent.type as "movie" | "tv",
        title: randomContent.title,
        posterPath: randomContent.poster,
        watchedAt: dayTimestamp + hourOffset,
        progressSeconds,
        totalSeconds: randomContent.duration,
      });
    }
  }

  // Insert all watch history records
  await db.insert(watchHistory).values(watchHistoryData);

  console.log(`✅ Watch history seeder completed - ${watchHistoryData.length} records created`);
}

main().catch(console.error);
