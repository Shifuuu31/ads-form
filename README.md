# CDBe Campaign Form

Existing campaign form application for the Association campaign workflow.

## Structure

- `src/index.js`: HTTP application entry point
- `src/config/env.js`: environment configuration
- `src/controllers/formController.js`: MongoDB form API controller
- `src/routes/formRoutes.js`: API route registration
- `src/formulaire-campagne-meta-ads.html`: existing form UI
- `src/app.js`: existing browser application logic
- `src/data/form-data.json`: migration seed data

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## MongoDB migration

Set the MongoDB values in `.env`, then run:

```bash
npm run migrate
```

The migration clears the configured forms collection and writes one canonical `form` record.

## Validation

```bash
npm run build
```
