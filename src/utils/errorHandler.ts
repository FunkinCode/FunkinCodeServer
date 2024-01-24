import { isHttpError } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import { Context } from "https://deno.land/x/oak@v12.6.2/context.ts";
import { Next } from "https://deno.land/x/oak@v12.6.2/middleware.ts";

export default async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        if (isHttpError(err)) {
            ctx.response.status = err.status;
        } else {
            ctx.response.status = 500;
        }
        ctx.response.body = { error: err.message };
        ctx.response.type = "json";
    }
};