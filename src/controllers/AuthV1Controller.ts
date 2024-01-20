import { DiscordUserData } from "../utils/interfaces.ts"
import { signInOrSignUpDiscord } from "../database/db.ts"
import { APIErrors } from "../utils/errorsCodes.ts"
import { Context } from "https://deno.land/x/oak@v12.6.2/context.ts";

export default {
    index(ctx: Context) {
        ctx.response.status = 200;
        ctx.response.body = { version: 1, releaseDate: new Date(1700626204000) };
    },

    async onDiscordCallback(ctx: Context) {
        const newRequest = new URL(ctx.request.url)

        if (!newRequest.searchParams.get("code")) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No haz puesto un codigo de acceso de Discord",
                errorCode: APIErrors.noDiscordCode
            }
            return
        }

        const headersList = {
            "Accept": "*/*",
            "Authorization": `Basic ${Deno.env.get("DISCORD_CLIENT_TOKEN")}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }

        // https://79e8-179-6-170-170.ngrok-free.app/auth/discord/callback
        // Get url of the request

        let redirect_uri = ctx.request.url.origin + ctx.request.url.pathname;

        //If not localhost, add https and remove http

        if (!redirect_uri.includes("localhost")) {
            redirect_uri = redirect_uri.replace("http://", "https://")
        }

        const bodyContent = `grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirect_uri) + (newRequest.searchParams.get("port") ? ("?port=" + newRequest.searchParams.get("port")) : "")}&code=${newRequest.searchParams.get("code")}`;

        const response = await fetch("https://discord.com/api/v10/oauth2/token", {
            method: "POST",
            body: bodyContent,
            headers: headersList
        }).then((response) => {
            return response.json()
        })

        if (!response.access_token) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "Error al obtener el token",
                errorCode: APIErrors.invalidDiscordCode
            }
            return
        }

        const headersList2 = {
            "Accept": "*/*",
            "Authorization": `Bearer ${response.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }

        const response2 = await fetch("https://discord.com/api/v10/users/@me", {
            method: "GET",
            headers: headersList2
        }).then((response) => {
            return response.json()
        })

        const user: DiscordUserData = {
            discordId: response2.id,
            username: response2.username,
            discriminator: response2.discriminator,
            avatar: response2.avatar ? `https://cdn.discordapp.com/avatars/${response2.id}/${response2.avatar}.png` : null,
            email: response2.email,
            verified: response2.verified,
            locale: response2.locale,
            flags: response2.flags,
            premium_type: response2.premium_type,
            mfa_enabled: response2.mfa_enabled
        }

        // SignUp and return token
        const token = await signInOrSignUpDiscord(user);

        if (!token) {
            ctx.response.status = 400;
            ctx.response.body = {
                response: "No se pudo crear el token",
                errorCode: APIErrors.errorCreatingToken
            }
            return;
        }

        if (!newRequest.searchParams.get("port")) {
            ctx.response.status = 200;
            ctx.response.body = {
                token
            }
        } else {
            // Redirect to http://127.0.0.1:$port/login?token=token
            ctx.response.redirect(`http://127.0.0.1:${newRequest.searchParams.get("port")}/login?type=discord&token=${token}`)
        }

    },

    onDiscordLogin(ctx: Context) {
        const newRequest = new URL(ctx.request.url)

        const port = newRequest.searchParams.get("port");

        if (!port) ctx.response.redirect(`https://discord.com/oauth2/authorize?client_id=${Deno.env.get("DISCORD_CLIENT_ID")}&response_type=code&redirect_uri=${encodeURIComponent(Deno.env.get("HOST_FULL") || "")}%2Fauth%2Fdiscord%2Fcallback&scope=identify+email`)
        
        else ctx.response.redirect(`https://discord.com/oauth2/authorize?client_id=${Deno.env.get("DISCORD_CLIENT_ID")}&response_type=code&redirect_uri=${encodeURIComponent(Deno.env.get("HOST_FULL") || "")}%2Fauth%2Fdiscord%2Fcallback%3Fport%3D${port}&scope=identify+email`)
    }
};