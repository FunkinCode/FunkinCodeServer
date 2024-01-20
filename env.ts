import { load } from "https://deno.land/std@0.212.0/dotenv/mod.ts";


export async function envData() {
    const env = await load()

    for (const [key, value] of Object.entries(env)) {
        Deno.env.set(key, value)
    }
}