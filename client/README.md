# Stagnum client

-   [Development setup](#development-setup)
    -   [Installing Node.js](#installing-node.js)
    -   [Installing dependencies](#installing-dependencies)
    -   [Running the client locally](#running-the-client-locally)
-   [Running tests](#running-tests)
-   [Running with docker](#running-with-docker)

## Development setup

### Installing Node.js

Development is conducted using Node.js. You can download it from
[the official Node.js website](https://nodejs.org/en/).

### Installing dependencies

You can install dependencies by running this command in the client root folder

```bash
npm install
```

### Setting up the environments

The frontend uses the following environment variables.

-   `NEXT_PUBLIC_FRONTEND_URI`: the clients uri. This is used for the spotify authentication callback.
-   `NEXT_PUBLIC_BACKEND_URI`: the backends uri. This is used to communicate to the backend.

#### How to set environment variables

Setting an environment variable should be straightforward, here's how to do it with bash and powershell:

```bash
# bash
export NEXT_PUBLIC_FRONTEND_URI="http://localhost:80"
```

```powershell
// Powershell
$Env:NEXT_PUBLIC_FRONTEND_URI="http://localhost:80"
```

### Running the client locally

Once you have Node.js and the dependencies installed you can run the client application locally by running this command in the client root folder

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to verify that the client is running.

The application will automatically update once you save your code changes.

## Running with docker

To run tests once for the application you can simply run

```bash
npm run test
```

Or you can run them continuously after every change with

```bash
npm run test:watch
```

## Running with docker

If you don't need to do development work on the client and just want it running to, for
example, test the backend against it, it is recommended to run the client with docker.
You can find detailed instructions for installing Docker from their
["Get started" site](https://www.docker.com/get-started/).

Once you have Docker installed and running on your computer, running the server is as
simple as entering the following commands in the project root.

```
docker build -t stagnum-client ./client
docker run -p 3000:3000 stagnum-client
```

Open [http://localhost:3000](http://localhost:3000) with your browser to verify that the client is running.
