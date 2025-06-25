# Stagnum client

## Development setup

### Node, Yarn, packages

The client uses yarn for package management and is developed with Vite. Vite needs node, which you can get
from the [official Node.js website](https://nodejs.org/en/).

After you have node you need to enable corepack to use Yarn:

Enable corepack (requires admin rights)

```bash
corepack enable
```

Install packages

```bash
yarn
```

### Environment variables

You need to set two environment variables into a `.env` file in the client root folder (where this file
resides) for the client to work: `VITE_FRONTEND_URL` and `VITE_BACKEND_URL`. The `example.env` file should
have sound defaults for those values when it comes to local development; In most cases you should be able
to simply copy it and rename the copy to `.env`. Especially if your local development server is also
using default values for port.

## Running the project

You should set up automatic formatting with prettier on save for your own convenience, and some automatic
highlighting on lint errors depending on your environment. However, if you don't have those you can always
lint and format via a script:

```bash
yarn lf
```

After there are no linting or formatting errors in the code starting the client in development mode is
done with one more script:

```bash
yarn dev
```

## Running tests

```bash
yarn test
```
