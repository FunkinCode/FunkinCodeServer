import { getPublicUser, verifyToken, getMyUser } from "../database/db.ts"
import { APIErrors } from "../utils/errorsCodes.ts"
import { Context } from "https://deno.land/x/oak@v12.6.2/context.ts";
import { RouterContext } from "https://deno.land/x/oak@v12.6.2/mod.ts";

export default {
    index(ctx: Context) {
        ctx.response.status = 200;
        ctx.response.body = { version: 1, releaseDate: new Date(1700626204000) };
    },

    getMod(ctx: RouterContext<"/api/v1/mod/:id">) {
        //Get ID
        const id = ctx.params.id;

        //TODO(FIX): Fix this pleaseeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee -MDC

        ctx.response.status = 200;
        ctx.response.body = {
            name: "Test Mod",
            author: {
                ID: 123,
                avatarURL: "https://cdn.discordapp.com/avatars/1103388964485869609/d30efa5bed173b942c0bb4d9dc1f98ab.webp",
                modsPublished: [],
                name: "Mr Niz",
                globalName: "Mr Niz",
                username: "mrniz"
            },
            downloadLink: "https://cdn.discordapp.com/attachments/969730941956280352/1175867699495182366/TestMod.zip?ex=656ccb22&is=655a5622&hm=4ea8c805e804c2f002208e037cb145d23dc56523df9640b872f81dacc1ba119b&",
            deleted: false,
            ID: id
        };
    },

    async getUser(ctx: RouterContext<"/api/v1/user/:id">) {
        //Get ID
        const id = ctx.params.id;

        if (!id) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No haz puesto la ID del usuario",
                errorCode: APIErrors.noUserID
            }

            return;
        }

        const user = await getPublicUser(id);

        if (!user) {
            ctx.response.status = 404;
            ctx.response.body = {
                message: "No existe el usuario",
                errorCode: APIErrors.userDontExists
            }

            return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
            user
        }

        return;
    },

    async getMyUser(ctx: Context) {
        //Get ID
        const token = ctx.request.headers.get("Authorization")

        if (!token) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No haz enviado tu token",
                errorCode: APIErrors.noUserID
            }

            return;
        }

        // Remove bearer of bearer token
        const tokenWithoutBearer = token.replace("Bearer ", "");

        if (!(await verifyToken(tokenWithoutBearer))) {
            ctx.response.status = 401;
            ctx.response.body = {
                message: "Token invalido",
                errorCode: APIErrors.invalidToken
            }

            return;
        }

        const user = await getMyUser(tokenWithoutBearer);

        if (!user) {
            ctx.response.status = 404;
            ctx.response.body = {
                message: "No existe el usuario",
                errorCode: APIErrors.userDontExists
            }

            return;
        }

        delete user._id;

        ctx.response.status = 200;
        ctx.response.body = {
            ...user
        }

        return;
    }
};