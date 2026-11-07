import createBackendApp from "../src/create-backend-app.js";

let backendAppPromise;

const getBackendApp = () => {
  if (!backendAppPromise) {
    backendAppPromise = createBackendApp().catch((error) => {
      backendAppPromise = undefined;
      throw error;
    });
  }

  return backendAppPromise;
};

export default async function handler(req, res) {
  const app = await getBackendApp();
  return app(req, res);
}
