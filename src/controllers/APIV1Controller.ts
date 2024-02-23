import { BaseMod } from '../utils/interfaces.ts';
import { getPublicUser, UpdateUserInApp, UploadMod, getMod, getListMods } from "../database/db.ts"
import { APIErrors } from "../utils/errorsCodes.ts"
import { Context } from "https://deno.land/x/oak@v12.6.2/context.ts";
import { RouterContext } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import { Request } from "../utils/interfaces.ts"

export default {
    index(ctx: Context) {
        ctx.response.status = 200;
        ctx.response.body = { version: 1, releaseDate: new Date(1700626204000) };
    },

    async getUser(ctx: RouterContext<"/v1/user/:id">) {
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

    },
    
    async uploadMod(ctx: Context) {
        if (!(ctx.request as Request).auth) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No estas autorizado para subir un mod",
                errorCode: APIErrors.noToken
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

        const newData = ctx.request.body({
            type: "json"
        });

        let mod: BaseMod;

        try {
            mod = (await newData.value) as BaseMod;

            //Check if have all necessary data
            if ((!mod.URLDownload && !mod.GithubRepo) || !mod.name || !mod.version || !mod.tags || (mod.flags === undefined || mod.flags === null) || !mod.banner || !mod.imgs || !mod.deltaName) {
                throw new Error("No estan todos los datos necesarios para subir el mod");
            }
        } catch (_e) {
            console.log(_e)
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No estan todos los datos necesarios para subir el mod",
                errorCode: APIErrors.invalidJsonUserUpdate
            }

            return;
        }

        mod.owner = user.ID;

        // Regex for version
        const versionRegex = new RegExp(/(\d+\.\d+\.\d+)(-\w+)?/);

        if (!versionRegex.test(mod.version)) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "La version no es valida",
                errorCode: APIErrors.invalidVersionMod
            }

            return;
        }

        if(mod.URLDownload) {
            const urlRegex = new RegExp(/(https:\/\/drive\.usercontent\.google\.com\/download\?id=|https:\/\/drive\.google\.com\/uc\?id=|https:\/\/github\.com\/.*\/.*\/archive\/refs\/.*\.(zip|tar\.gz))/);

            if (!urlRegex.test(mod.URLDownload)) {
                ctx.response.status = 400;
                ctx.response.body = {
                    message: "La URL de descarga no es valida",
                    errorCode: APIErrors.invalidURLMod
                }
    
                return;
            }
        }

        if (mod.GithubRepo) {
            const githubRepoRegex = new RegExp(/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/);

            if (!githubRepoRegex.test(mod.GithubRepo)) {
                ctx.response.status = 400;
                ctx.response.body = {
                    message: "El repositorio de github no es valido",
                    errorCode: APIErrors.invalidURLMod
                }

                return;
            }
        }

        if(!mod.GithubRepoBranch) mod.GithubRepoBranch = "master";

        if (await UploadMod(mod)) {
            ctx.response.status = 200;
            ctx.response.body = {
                message: "Se a logrado subir exitosamente el mod.",
            }

            return;
        } else {
            ctx.response.status = 500;
            ctx.response.body = {
                message: "A habido un error al subir el mod",
                errorCode: APIErrors.errorToUploadMod
            }

            return;
        }

    },

    async getMod(ctx: RouterContext<"/v1/mod/:id">) {
        //Get ID
        const id = ctx.params.id;

        if (!id) {
            ctx.response.status = 400;
            ctx.response.body = {
                message: "No haz puesto la ID del mod",
                errorCode: APIErrors.noModID
            }

            return;
        }

        const mod = await getMod(id);

        if (!mod) {
            ctx.response.status = 404;
            ctx.response.body = {
                message: "No existe el mod",
                errorCode: APIErrors.modDontExists
            }

            return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
            ...mod
        }

        return;
    },

    async getMods(ctx: Context) {
        const limit = ctx.request.url.searchParams.get("limit") || "10";
        const page = ctx.request.url.searchParams.get("page") || "1";

        const mods = await getListMods(Number(limit), Number(page));

        if (!mods) {
            ctx.response.status = 500;
            ctx.response.body = {
                message: "A habido un error al obtener los mods",
                errorCode: APIErrors.errorToUploadMod
            }

            return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
            mods
        }

        return;
    }

};