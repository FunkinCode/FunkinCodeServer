import { getPublicUser, UpdateUserInApp } from "../database/db.ts"
import { APIErrors } from "../utils/errorsCodes.ts"
import { Context } from "https://deno.land/x/oak@v12.6.2/context.ts";
import { RouterContext } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import { Request } from "../utils/interfaces.ts"

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

    getMyUser(ctx: Context) {

        if (!(ctx.request as Request).auth) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No haz enviado tu token",
                errorCode: APIErrors.noUserID
            }

            return;
        }

        const user = (ctx.request as Request).user;

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
    },

    async updateUser(ctx: Context) {

        if (!(ctx.request as Request).auth) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No haz enviado tu token",
                errorCode: APIErrors.noUserID
            }

            return;
        }

        const user = (ctx.request as Request).user;

        if (!user) {
            ctx.response.status = 404;
            ctx.response.body = {
                message: "No existe el usuario",
                errorCode: APIErrors.userDontExists
            }

            return;
        }

        switch ((ctx.request as Request).typeOfToken) {
            case ("funkincodeAPP"): {
                const newData = ctx.request.body({
                    type: "json"
                });

                const { DisplayUsername, Private, AvatarURL } = await newData.value;

                if (!DisplayUsername || typeof Private !== "boolean" || !AvatarURL) {
                    ctx.response.status = 400;
                    ctx.response.body = {
                        message: "No estan todos los datos necesarios para editar",
                        errorCode: APIErrors.invalidJsonUserUpdate
                    }

                    return;
                }

                if (await UpdateUserInApp(user.ID, {
                    DisplayUsername,
                    Private,
                    AvatarURL
                })) {
                    ctx.response.status = 200;
                    ctx.response.body = {
                        message: "Se a logrado editar exitosamente el usuario.",
                    }

                    return;
                }

                ctx.response.status = 500;
                ctx.response.body = {
                    message: "A habido un error al editar los datos del usuario",
                    errorCode: APIErrors.errorToUpdateUser
                }

                return;


            }
        }

    }
};