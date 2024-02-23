import { Router } from "https://deno.land/x/oak@v12.6.2/mod.ts";
import APIV1Controller from "../controllers/APIV1Controller.ts";

const router = new Router();

router
  .get("/v1", APIV1Controller.index)
  .get("/v1/user/@me", APIV1Controller.getMyUser)
  .patch("/v1/user/@me", APIV1Controller.updateUser)
  .get("/v1/user/:id", APIV1Controller.getUser)
  .post("/v1/mod", APIV1Controller.uploadMod)
  .get("/v1/mod/:id", APIV1Controller.getMod)
  .get("/v1/mods", APIV1Controller.getMods)

export default router;