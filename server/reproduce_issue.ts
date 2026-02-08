
import { storage } from "./storage";
import { db } from "./db";
import { sparks } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

async function main() {
    console.log("--- Debugging Daily Devotional ---");

    // 1. Check getLondonDate (I have to access it via prototype or just copy logic as it is private)
    const getLondonDate = () => {
        const londonTime = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
        const parts = londonTime.split(',')[0].split('/');
        // Check if parts are correct
        console.log("London Time Raw:", londonTime);
        console.log("London Date Parts:", parts);
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    };

    const todayLondon = getLondonDate();
    console.log("Calculated Today London Date:", todayLondon);

    // 2. Query Sparks for today and recent days
    console.log("\n--- Recent Sparks in DB ---");
    const recentSparks = await db.select().from(sparks)
        .orderBy(desc(sparks.dailyDate))
        .limit(10);

    recentSparks.forEach(s => {
        console.log(`ID: ${s.id}, Title: ${s.title}, Date: ${s.dailyDate}, Status: ${s.status}, Audience: ${s.audienceSegment}`);
    });

    // 3. Check getTodaySpark result
    console.log("\n--- getTodaySpark() Result ---");
    const todaySpark = await storage.getTodaySpark();
    if (todaySpark) {
        console.log(`Returned Spark: ID: ${todaySpark.id}, Title: ${todaySpark.title}, Date: ${todaySpark.dailyDate}`);
    } else {
        console.log("No spark returned by getTodaySpark()");
    }

    process.exit(0);
}

main().catch(console.error);
