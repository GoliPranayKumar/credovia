const PROJECT_ID = "69b3b08f003c9211b0b8";
const API_KEY = "standard_3149cd1073170665bc97fdeffe49d360c26436f2e750a285dd88ef6411d1755b23722d324006f5478c86bc156c426baa98c4e84f90add223f3ec41d4e0f619f89cfc27e5004b01589c31602e83cae2bb81b906063df2549d07956f69577db6110aae9d5f396b151c4fdc62df641e42bfaee2f6b48de906754cdedb1101932266";
const ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "69b3b1ae003ab31e28fa";
const USERS_COLLECTION_ID = "69b3b5b112d780c264c5"; 

const HEADERS = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY
};

async function fixPermissions() {
    console.log("Fixing permissions for Users collection...");
    try {
        const response = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${USERS_COLLECTION_ID}`, {
            method: "PATCH",
            headers: HEADERS,
            body: JSON.stringify({
                permissions: [
                    'read("any")',
                    'create("any")',
                    'update("any")',
                    'delete("any")'
                ]
            })
        });
        const result = await response.json();
        console.log("Permissions result:", result.message || "Success");

        // Also ensure we have a Reviews collection or at least prevent errors
        console.log("Checking for Reviews collection...");
        const reviewsRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections`, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({
                collectionId: "reviews",
                name: "Reviews",
                documentSecurity: false,
                permissions: [
                    'read("any")',
                    'create("any")',
                    'update("any")'
                ]
            })
        });
        const reviewsData = await reviewsRes.json();
        if (reviewsData.$id) {
            console.log("Reviews Collection Created:", reviewsData.$id);
            // Add basic attributes
            const attrs = [
                { key: "targetUserId", type: "string", size: 64, required: true },
                { key: "authorId", type: "string", size: 64, required: true },
                { key: "rating", type: "integer", required: true, min: 1, max: 5 },
                { key: "content", type: "string", size: 1000, required: false }
            ];
            for (const attr of attrs) {
                console.log(`Adding attribute ${attr.key} to Reviews...`);
                await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/reviews/attributes/${attr.type === 'integer' ? 'integer' : 'string'}`, {
                    method: "POST", headers: HEADERS, body: JSON.stringify(attr)
                });
                await new Promise(r => setTimeout(r, 1000));
            }
        } else {
            console.log("Reviews collection might already exist or failed to create.");
        }

    } catch (e) {
        console.error("Error fixing permissions:", e);
    }
}

fixPermissions();
