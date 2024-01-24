import { envData } from "../../env.ts"

await envData()

// Import the latest major version of the MongoDB driver
import { MongoClient } from "npm:mongodb@6";
import { DiscordUserData, UserData, UsersDatabaseData, TokensInterface, TokenPayloadInterface, UpdateAppUserData } from "../utils/interfaces.ts"
import Snowflake from "https://deno.land/x/snowflake@v1/mod.ts";
import * as jose from 'https://deno.land/x/jose@v5.2.0/index.ts'

const snowflake = new Snowflake({ epoch: 1703705222 });
const client = new MongoClient(Deno.env.get("MONGODB_URL") || "");
const dbName = Deno.env.get("MONGODB_COLLECTION");

// Connect to the local mongod instance
await client.connect();

// Get a reference to a collection
const db = client.db(dbName);

const secret = new TextEncoder().encode(
    Deno.env.get("JWT_SECRET"),
)
const alg = 'HS256'

const users = db.collection<UsersDatabaseData>("users");

const tokens = db.collection<TokensInterface>("token")

// Create a function for sign-in or if the user dont exist, sign-up and return the a token for the user, check if the email exist in the database, in case exist, add discordid to profile, this is for discord oauth
export async function signInOrSignUpDiscord(DiscordUserData: DiscordUserData): Promise<string | undefined> {
    const user = await users.findOne({ DiscordID: DiscordUserData.discordId });
    if (user) {
        const newToken = await createToken(user.ID);
        return newToken;
    } else {
        if (DiscordUserData.email) {
            const user = await users.findOne({ Email: DiscordUserData.email });
            if (user) {
                await users.updateOne({ ID: DiscordUserData.discordId }, { $set: { DiscordID: DiscordUserData.discordId, LastUpdated: new Date() } });

                const newToken = await createToken(user.ID);
                return newToken;
            } else {
                await users.insertOne({
                    ID: snowflake.generate(),
                    Username: DiscordUserData.username,
                    Email: DiscordUserData.email || undefined,
                    DisplayUsername: DiscordUserData.displayname,
                    AvatarURL: DiscordUserData.avatar || undefined,
                    DiscordID: DiscordUserData.discordId,
                    GithubID: "",
                    Flags: 0,
                    CreatedAt: new Date(),
                    LastUpdated: new Date(),
                    Private: false
                });

                //Get the new user
                const newUser2 = await users.findOne({ DiscordID: DiscordUserData.discordId });
                if (!newUser2) return;

                return await createToken(newUser2.ID);
            }
        }
    }
}

async function createToken(ID: string): Promise<string> {
    const jwt = await new jose.SignJWT({ ID })
        .setProtectedHeader({ alg })
        .setExpirationTime('30d')
        .setIssuedAt()
        .setIssuer('funkincodeAPI')
        .setAudience('funkincodeAPP')
        .sign(secret)

    // Upload to tokens 
    await tokens.insertOne({
        ID,
        Token: jwt,
        Deleted: false
    });

    return jwt;
}

export async function getPublicUser(ID: string): Promise<UserData | null>  {
    const user = await users.findOne({ ID });
    if(!user) return null;
    // Convert usersinterface to userData
    return {
        ID: user.ID,
        Username: user.Username,
        DisplayUsername: user.DisplayUsername,
        AvatarURL: user.AvatarURL,
        Flags: user.Flags,
        CreatedAt: user.CreatedAt,
    }
}

interface verifyToken {
    exist: boolean;
    type?: string;
}

export async function verifyToken(Token: string): Promise<verifyToken>{
    const tokenInfo = await tokens.findOne({Token: Token});
    if(!tokenInfo) return {
        exist: false
    };
    if(tokenInfo.Deleted) return {
        exist: false
    };
    const payload = (await jose.jwtVerify(Token, secret))?.payload as unknown as TokenPayloadInterface;
    if(!payload) return {
        exist: false
    };
    const user = await users.findOne({ ID: payload.ID });
    if(!user) return {
        exist: false
    };
    return {
        exist: true,
        type: payload.aud
    };
}

export async function getMyUser(Token: string): Promise<UsersDatabaseData | null> {
    try {
        if(!(await verifyToken(Token)).exist) return null;
        const payload = (await jose.jwtVerify(Token, secret))?.payload as unknown as TokensInterface;
        if(!payload) return null;
        const user = await users.findOne({ ID: payload.ID });
        if(!user) return null;
        return user;
    } catch (_e) {
        console.log(_e)
        return null;
    }
}

export async function UpdateUserInApp(ID: string, data: UpdateAppUserData): Promise<boolean>  {
    const user = await users.findOne({ ID });
    if(!user) return false;
    await users.updateOne({ID}, { $set: {DisplayUsername: data.DisplayUsername, AvatarURL: data.AvatarURL, Private: data.Private}})
    return true;
}
// 