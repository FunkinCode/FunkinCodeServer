import { Context } from "https://deno.land/x/oak@v12.6.2/context.ts";
import { Next } from "https://deno.land/x/oak@v12.6.2/middleware.ts";
import { Request } from "../utils/interfaces.ts";
import { getMyUser } from "../database/db.ts";

export default async (ctx: Context, next: Next) => {
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "")
    const result = await getMyUser(token||"");
    if(result) {
        (ctx.request as Request).auth = true;
        (ctx.request as Request).user = result;
    }
    await next();
};