# Stagnum

A pool-based playback system around Spotify.

This is a course project for LUT course "Running a Software Project". The project will be
converted into an OSS project after the course ends.

# Running the project

The suggested way of running the project is with docker compose. For configuring the docker compose runtime, you should
use [environment variables](#set-up-environment-variables) and [secret files](#set-up-secrets).

## Set up environment variables

The used environment variables can be seen from the `example.env` file. For normal local development you can simply copy
the file and rename the copy into `.env`. The values in `example.env` are good defaults and the application should work
fine using them. There should be no need to change the values unless you specifically want to experiment with different
settings.

The full list of environment variable meanings can be seen by combining `client/README.md` section 
`setting up the environments` and `server/README.md` section `Running the server`. 

There are some notable change for docker compose running for server environment variables. The first one is the 
splitting of the `DATABASE_CONNECTION_URL`. Instead, the env file contains variables `POSTGRES_USER`, 
`POSTGRES_PASSWORD` and `POSTGRES_DB`. These are used to configure the docker container running PostgreSQL and then 
combined to form the database connection url that is fed to the server. For local development these can thus be 
anything and can be left as their default values. The variables controlling auto-reload, the host and the port are also 
not present. Instead, variables `BACKEND_PORT` and `FRONTEND_PORT` control which ports docker exposes for the backend 
and the frontend respectively.

## Set up secrets

If running the application with docker compose, you should store your spotify application secrets in secret files in the
repository root.

The secrets should reside in the files `secret_spotify_client_id.txt` and `secret_spotify_client_secret.txt`. Add the 
files into the repository root and fill them with your spotify app credentials. You need to get these secrets from 
[Spotify](https://developer.spotify.com/dashboard). See more about these secrets in `server/README.md`.

## Run

To run the project after you have set up the secrets and environment variables.

```bash
docker compose up -d
```

This might take some time. You can check the health of the backend by navigating to 
[`localhost:8080/health`](http://localhost:8080/health). This includes the database health. If the application is fully
functional, the return value should look something like follows:

```json
{
    "status": "HEALTHY",
    "time_elapsed": "PT0.046225S",
    "resources": [
        {
            "status": "HEALTHY",
            "time_elapsed":"PT0.001002S",
            "resource":"database"
        }
    ]
}
```

# Developing

For developing and running server and client locally without docker compose in `client/README.md` and 
`server/README.md`.