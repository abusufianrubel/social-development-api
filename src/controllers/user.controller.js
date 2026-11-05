import { sendSuccess } from "../utils/api-response.js";

export const getProfileController = (userService) => async (req, res) => {
  const user = await userService.getProfile(req.auth.user);

  return sendSuccess(res, {
    message: "Profile retrieved successfully",
    data: { user },
  });
};

export const updateProfileController = (userService) => async (req, res) => {
  const user = await userService.updateProfile(
    req.auth.user,
    req.validatedBody
  );

  return sendSuccess(res, {
    message: "Profile updated successfully",
    data: { user },
  });
};
