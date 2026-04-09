/**
 * update-schema-leetcode.js
 * Adds LeetCode fields to Appwrite USERS_COLLECTION_ID.
 * Run once: node update-schema-leetcode.js
 */

const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const db = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";

const attributes = [
  { type: "string",  key: "leetcodeUsername",  size: 100,  required: false, default: null },
  { type: "integer", key: "leetcodeEasy",                  required: false, default: 0, min: 0, max: 10000 },
  { type: "integer", key: "leetcodeMedium",                required: false, default: 0, min: 0, max: 10000 },
  { type: "integer", key: "leetcodeHard",                  required: false, default: 0, min: 0, max: 10000 },
  { type: "float",   key: "leetcodeScore",                 required: false, default: 0, min: 0, max: 100 },
  { type: "string",  key: "leetcodeFetchedAt", size: 64,   required: false, default: null },
];

async function run() {
  console.log("Adding LeetCode attributes to Appwrite collection...\n");

  for (const attr of attributes) {
    try {
      if (attr.type === "string") {
        await db.createStringAttribute(
          DATABASE_ID, COLLECTION_ID,
          attr.key, attr.size, attr.required, attr.default
        );
      } else if (attr.type === "integer") {
        await db.createIntegerAttribute(
          DATABASE_ID, COLLECTION_ID,
          attr.key, attr.required, attr.min, attr.max, attr.default
        );
      } else if (attr.type === "float") {
        await db.createFloatAttribute(
          DATABASE_ID, COLLECTION_ID,
          attr.key, attr.required, attr.min, attr.max, attr.default
        );
      }
      console.log(`✅  Created: ${attr.key} (${attr.type})`);
    } catch (err) {
      if (err?.code === 409) {
        console.log(`⚠️   Exists:  ${attr.key} (skipped)`);
      } else {
        console.error(`❌  Failed:  ${attr.key} →`, err?.message);
      }
    }

    // Appwrite requires a short pause between attribute creations
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log("\nDone. Add APPWRITE_API_KEY to .env.local if you haven't already.");
}

run();
