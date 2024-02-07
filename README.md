# Stagnum

A pool-based playback system around Spotify.

This is a course project for LUT course "Running a Software Project". The project will be
converted into an OSS project after the course ends.

More info TBA.

# Running the project
The suggested way of running the project is with docker compose.

```bash
docker compose up -d
```


# Developing

The suggested way of developing is with docker compose watch this allows for live reloading of changes. The liveload affects both frontend and backend.

## Live reload
```bash
docker compose watch
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
