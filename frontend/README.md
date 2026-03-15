# Frontend Workspace

This folder is a non-destructive frontend extraction from the main project root.

## Current state

- Root project is still intact and unchanged as the primary rollback path.
- Frontend source and config are copied here so you can work without mixing with backend/ai files.
- This folder can run independently with its own package.json.

## Run frontend here

```bash
cd frontend
npm install
npm run dev
```

Default dev URL: <http://localhost:3000>

## Build

```bash
npm run build
npm run preview
```

## Notes

- This is step 1 of the split. We have not removed or renamed any root files.
- After you confirm stable operation here, we can do step 2:
  - point root scripts to `frontend/`
  - clean redundant root frontend files in a controlled pass
