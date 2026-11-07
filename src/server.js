import "dotenv/config";

import createBackendApp from "./create-backend-app.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    const app = await createBackendApp();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
