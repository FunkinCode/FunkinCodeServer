import { Router } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import AuthV1Controller from "../controllers/AuthV1Controller.ts";

const router = new Router();

router
  .get("/auth/discord/login", AuthV1Controller.onDiscordLogin)
  .get("/auth/discord/callback", AuthV1Controller.onDiscordCallback)
  
export default router;