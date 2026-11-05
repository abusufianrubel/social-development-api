export const sendSuccess = (
  res,
  { statusCode = 200, message, data } = {}
) => {
  const response = { success: true };

  if (message !== undefined) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res,
  { statusCode = 500, message = "Internal server error", errors } = {}
) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
