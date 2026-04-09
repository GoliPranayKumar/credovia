const PROJECT_ID = "69b3b08f003c9211b0b8";
const API_KEY = "standard_3149cd1073170665bc97fdeffe49d360c26436f2e750a285dd88ef6411d1755b23722d324006f5478c86bc156c426baa98c4e84f90add223f3ec41d4e0f619f89cfc27e5004b01589c31602e83cae2bb81b906063df2549d07956f69577db6110aae9d5f396b151c4fdc62df641e42bfaee2f6b48de906754cdedb1101932266";
const ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "69b3b1ae003ab31e28fa";
const USERS_COLLECTION_ID = "69b3b5b112d780c264c5";
const REVIEWS_COLLECTION_ID = "reviews";

const HEADERS = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY
};

async function forcePermissions() {
    console.log("Applying FORCE permissions...");
    
    // Fix Users Collection
    const usersRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${USERS_COLLECTION_ID}`, {
        method: "PUT", // Use PUT to overwrite/update full config if PATCH is finicky
        headers: HEADERS,
        body: JSON.stringify({
            name: "Users",
            permissions: [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ],
            documentSecurity: false
        })
    });
    console.log("Users Fix Status:", usersRes.status);
    
    // Fix Reviews Collection
    const reviewsRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${REVIEWS_COLLECTION_ID}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify({
            name: "Reviews",
            permissions: [
                'read("any")',
                'create("any")',
                'update("any")'
            ],
            documentSecurity: false
        })
    });
    console.log("Reviews Fix Status:", reviewsRes.status);
}

forcePermissions();
