# Stagnum

A pool-based playback system around Spotify.

This is a course project for LUT course "Running a Software Project". The project will be
converted into an OSS project after the course ends.

More info TBA.

# Running the project
The suggested way of running the project is with docker compose. This project uses secrets so you need to setup secret files.

## Setup secrets
Create files `secret_spotify_client_id.txt` and `secret_spotify_client_secret.txt` and fill them with your spotify app credentials. You need to get these secrets from [Spotify](https://developer.spotify.com/dashboard). 
See more about these secrets `server/README.md`.

## Run
To run the project after you have setup the secrets.

```bash
docker compose up -d
```


# Developing
Set the same secrets files

See more about developing and running from `client/README.md` and `server/README.md`.

## Docker Compose
To get changes made to the docker containers rebuild and deploy the images.

```bash
docker compose up --build --force-recreation
```

## Frontend
The resulting website would be available on the localhost:3000. You can change this by modifying the value after -p flag. 
```bash
cd client/
docker .build -t stagnum-frontend
docker run --rm -p 3000:3000 stagnum-frontend
```

## Backend
The resulting backend would be available on localhost:8080. The port 8080 is expected by the frontend. The backend needs a database connection and you need to provide that to yourself when not running with docker compose. The example connection string is to postgresql

```bash
cd server/
docker build . -t stagnum-backend
docker run --rm -p 8080:8080 -e DATABASE_CONNECTION_URL=postgresql://root:pass@database:5432/data stagnum-backend
```
