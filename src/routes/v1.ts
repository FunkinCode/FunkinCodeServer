import { Router } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import APIV1Controller from "../controllers/APIV1Controller.ts";

const router = new Router();

router
  .get("/api/v1", APIV1Controller.index)
  .get("/api/v1/mod/:id", APIV1Controller.getMod)
  .get("/api/v1/user/@me", APIV1Controller.getMyUser)
  .get("/api/v1/user/:id", APIV1Controller.getUser)

export default router;