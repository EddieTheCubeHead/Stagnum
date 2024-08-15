# Stagnum client rewrite

During the coursework there were multiple times the team encountered difficulties using Next.js for pure frontend
work with a different server implementation. Moreover, because of repeated crunches to get the frontend
into a presentable state for the course demo sessions, the code quality produced was subpar.

To fix both of these issues a decision was made to rewrite the whole frontend. The framework chosen to be used for
the rewrite was Vite, based on recommendations by acquaintances. The package manager was also changed from npm to
yarn, based on prior good experience.

The aim is to reach the same quality the backend has. This includes both architecture with small components and
overall reusable code, as well as tooling with extremely high test coverage, extensive typing, linting and code
formatting.

## Running the project

Enable corepack (requires admin rights)

```bash
corepack enable
```

Install packages

```bash
yarn
```

Lint and format

```bash
yarn lf
```

Run development server

```bash
yarn dev
```
