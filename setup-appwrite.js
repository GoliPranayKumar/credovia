const fs = require('fs');

const PROJECT_ID = "69b3b08f003c9211b0b8";
const API_KEY = "standard_3149cd1073170665bc97fdeffe49d360c26436f2e750a285dd88ef6411d1755b23722d324006f5478c86bc156c426baa98c4e84f90add223f3ec41d4e0f619f89cfc27e5004b01589c31602e83cae2bb81b906063df2549d07956f69577db6110aae9d5f396b151c4fdc62df641e42bfaee2f6b48de906754cdedb1101932266";
const ENDPOINT = "https://sgp.cloud.appwrite.io/v1";

const HEADERS = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY
};

async function setup() {
    try {
        const dbId = "69b3b1ae003ab31e28fa";
        console.log("Using DB ID:", dbId);
        
        console.log("Creating Users Collection...");
        const colRes = await fetch(`${ENDPOINT}/databases/${dbId}/collections`, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({
                collectionId: "unique()",
                name: "Users",
                documentSecurity: false,
                permissions: [
                    'read("any")',
                    'write("any")',
                    'update("any")',
                    'delete("any")'
                ]
            })
        });
        
        const colData = await colRes.json();
        const usersColId = colData.$id;
        console.log("Users Collection ID:", usersColId);

        const attributes = [
            { key: "userId", type: "string", size: 64, required: true },
            { key: "name", type: "string", size: 100, required: true },
            { key: "email", type: "string", size: 254, required: false },
            { key: "bio", type: "string", size: 1000, required: false },
            { key: "github", type: "string", size: 254, required: false },
            { key: "linkedin", type: "string", size: 254, required: false },
            { key: "portfolio", type: "string", size: 254, required: false },
            { key: "walletAddress", type: "string", size: 64, required: false },
        ];

        for (const attr of attributes) {
            console.log(`Creating attribute ${attr.key}...`);
            await fetch(`${ENDPOINT}/databases/${dbId}/collections/${usersColId}/attributes/string`, {
                method: "POST", headers: HEADERS, body: JSON.stringify(attr)
            });
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log("Creating integer attribute...");
        await fetch(`${ENDPOINT}/databases/${dbId}/collections/${usersColId}/attributes/integer`, {
            method: "POST", headers: HEADERS,
            body: JSON.stringify({ key: "score", required: false, min: 0, max: 100, default: 0 })
        });
        
        let envContent = fs.readFileSync('.env.local', 'utf8');
        envContent = envContent.replace(/NEXT_PUBLIC_APPWRITE_DATABASE_ID=.*/g, '');
        envContent = envContent.replace(/NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=.*/g, '');
        
        envContent += `\nNEXT_PUBLIC_APPWRITE_DATABASE_ID=${dbId}\nNEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersColId}\n`;
        fs.writeFileSync('.env.local', envContent.trim());

        console.log("SUCCESSFULLY SETUP APPWRITE DB!");
    } catch (e) {
        console.error("error:", e);
    }
}
setup();
