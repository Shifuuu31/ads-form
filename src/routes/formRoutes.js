import { createFormController } from '../controllers/formController.js';

export function createFormRoutes(getCollection) {
  const handleFormApi = createFormController(getCollection);

  return async function handleRoutes(req, res, url) {
    if (!url.pathname.startsWith('/api/')) return false;
    return handleFormApi(req, res, url);
  };
}
