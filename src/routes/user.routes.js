import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
} from "../controllers/user.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validators/user.validator.js";

const createUserRouter = (authenticate, userService) => {
  const router = Router();

  router.get(
    "/users/me",
    authenticate,
    getProfileController(userService)
  );
  router.patch(
    "/users/me",
    authenticate,
    validateBody(updateProfileSchema),
    updateProfileController(userService)
  );

  return router;
};

export default createUserRouter;
