# Stagnum

A pool-based playback system around Spotify.

This is a course project for LUT course "Running a Software Project". The project will be
converted into an OSS project after the course ends.

More info TBA.

# Running the project
The suggested way of running the project is with docker compose.
This project uses environment variables and can use secrets files.

The used environment variables can be seen from the example .env file.

## Setup secrets
If you don't want to store secrets in the environment variables secrets can be used.

You can create secret files to pass sensitive data to the environment.

Currently supported files `secret_spotify_client_id.txt` and `secret_spotify_client_secret.txt`. Add the files in the repository root and fill them with your spotify app credentials. You need to get these secrets from [Spotify](https://developer.spotify.com/dashboard). 
See more about these secrets `server/README.md`.

Fill the rest of example .env file with your environment variables according to the example.env.

## Run
To run the project after you have setup the secrets and environment variables.

```bash
docker compose up -d
```


# Developing
See about developing and running from `client/README.md` and `server/README.md`.