

import { Application } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import { default as APIV1Router } from "./src/routes/v1.ts";
import { default as AuthRouter } from "./src/routes/auth.ts";

import notFound from "./src/routes/404.ts";

const app = new Application();
const HOST = Deno.env.get("HOST") || "http://localhost";
const PORT = Number(Deno.env.get("PORT")) || 4000;

if(!Deno.env.get("DONTCRASHPLEASE")) {
    app.use(APIV1Router.routes());
    app.use(AuthRouter.routes());
    app.use(notFound);
}

console.log(`Server is started at ${HOST}:${PORT}`);
await app.listen({ port: PORT });