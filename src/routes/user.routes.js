import { Router } from "express";
import { sendSuccess } from "../utils/api-response.js";

const createUserRouter = (authenticate) => {
  const router = Router();

  router.get("/users/me", authenticate, (req, res) =>
    sendSuccess(res, {
      data: { user: req.auth.user },
    })
  );

  return router;
};

export default createUserRouter;
