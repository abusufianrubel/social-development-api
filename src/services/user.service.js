const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toPublicProfile = (user) => {
  if (!user) return null;

  return {
    id: user._id?.toString() ?? user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const createUserService = (userCollection) => {
  if (!userCollection) {
    throw new Error("Better Auth user collection is required");
  }

  return {
    async getProfile(authenticatedUser) {
      if (!authenticatedUser?.id) {
        throw createHttpError(401, "Authentication required");
      }

      const user = await userCollection.findOne(
        { _id: authenticatedUser.id },
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            emailVerified: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        }
      );

      if (!user) throw createHttpError(404, "User profile not found");
      return toPublicProfile(user);
    },

    async updateProfile(authenticatedUser, profileData) {
      if (!authenticatedUser?.id) {
        throw createHttpError(401, "Authentication required");
      }

      const update = {
        ...profileData,
        updatedAt: new Date(),
      };

      const result = await userCollection.findOneAndUpdate(
        { _id: authenticatedUser.id },
        { $set: update },
        {
          returnDocument: "after",
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            emailVerified: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        }
      );

      const updatedUser = result?.value ?? result;
      if (!updatedUser) throw createHttpError(404, "User profile not found");
      return toPublicProfile(updatedUser);
    },
  };
};
