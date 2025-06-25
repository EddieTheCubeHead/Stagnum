# Stagnum server

- [Development setup](#development-setup)
  - [Installing python](#installing-python)
  - [Creating a virtual environment](#creating-a-virtual-environment)
  - [Installing dependencies](#installing-dependencies)
  - [Ensuring you have Spotify application credential](#ensuring-you-have-spotify-application-credential)
  - [Running the server](#running-the-server)
  - [Running the test set](#running-the-test-set)
  - [Viewing API documentation](#viewing-api-documentation)
  - [Logging configuration](#logging-configuration)
- [Running with docker](#running-with-docker)
- [Running PostgreSQL locally](#running-postgresql-locally)
  - [Install and setup PostgreSQL (quick tutorial)](#install-and-setup-postgresql-quick-tutorial)
  - [Creating and running migrations](#creating-and-running-migrations)
- [How to set environment variables](#how-to-set-environment-variables)

## Development setup

This section should contain everything you need to set up a local development environment.

### Installing python

Development is conducted in python 3.12. You can download it from
[the official python website](https://www.python.org/downloads/). 

**Please note that using an older version of python WILL BREAK the server, as we are actively using two 
features (generics syntax, typing syntax) introduced in python 3.12!**

### Creating a virtual environment

It's recommended to create a virtual environment (venv, from now on) for each python program you run locally.
This prevents the packages you install from polluting the global package pool and prevents
having multiple versions of the same package installed.

You need to use the correct python executable to create the venv, as the executable used
will become the interpreter for the venv created. You can check the version with

```bash
python -V
```

Notice the capital V.

`python` uses python version from `PATH` in your computer. You can have multiple versions
installed. Pointing to `python.exe` in the installation root directly lets you choose which
version to use. For example on windows you could do:

```bash
C:\Users\user\AppData\Local\Programs\Python\Python311\python.exe -V
> 3.11.7

C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe -V
> 3.12.1
```

To create a venv, execute the command.

```bash
path-to-python-3-12-executable -m venv ./.venv
```

Then, you can use the following command to activate the venv (please choose the correct
script depending on the type of your terminal, the examples are for bash and powershell!)


```bash
# bash
.venv/Scripts/activate
```

```powershell
# Powershell
.venv/Scripts/activate.ps1
```

If the venv was activated correctly you should see line feeds start with `(.venv)` in your
terminal.

### Installing dependencies

Once you have activated the venv, you can install dependencies by running

```bash
pip install -r server/requirements.txt
```

in the repository root. Leave the `server/` -part out if you are working directly in the
server folder.

### Ensuring you have Spotify application credential

Please create a [Spotify Application](https://developer.spotify.com/dashboard). Store your client ID and client secret,
we will need them later. Before leaving, we need to add our local instance into the list of allowed redirect URIs for
OAuth: Go into the edit settings view (Basic information -> edit). Add [`http://localhost:80`](http://localhost:80) 
into the list of allowed Redirect URIs.

### Running the server

The server can be run by simply running the `src/main.py` script. There are some environment variables you
need to set beforehand, see [how to set environment variables](#how-to-set-environment-variables) for more info
on setting environment variables:

- `SPOTIFY_CLIENT_ID`: the client id of the Stagnum spotify application (or your personal dev app)
- `SPOTIFY_CLIENT_SECRET`: the client secret of the Stagnum spotify application (or your personal dev app)

There are further optional environment variables you can use to customize the behaviour of the server. These will
fall back to the default values presented here if not given.

Please note that it is highly recommended to set up a local PostgreSQL instance for development environments.
See [Running PostGreSQL locally](#running-postgresql-locally) for more information.

- `DATABASE_CONNECTION_URL`: control the SQLAlchemy database connection formation. Default
`sqlite:///:memory:`
- `VERBOSE_SQLALCHEMY`: control whether SQLAlchemy should output information into the console. Default `False`
- `HOST`: control the host ip of the server. Default `127.0.0.1`
- `PORT`: control the port of the server. Default `8080`
- `RELOAD`: control whether the server should auto-reload on updates. Default `True`
- `ENVIRONMENT`: control whether the server is run as a production server, or as a development server. Affects errors
with error code 500. Value `production` (caps-insensitive) hides further information. Default `production`
- `CORS_ORIGINS`: a comma-separated string of origins allowed for CORS. Default `http://localhost:80`

Finally, we have environmental variables for customizing randomization in pool playback. Setting these is also 
optional, the server will use default values if these are not set

- `CUSTOM_WEIGHT_SCALE`: control the effect of custom weight on song randomization. Formula is `W^C`, where `W` is the
value given here, and `C` is the custom weight given by user (`[-1, 1]`). Default `5`
- `USER_WEIGHT_SCALE`: control the effect of playback time weight on song randomization. Formula is `W^Ft`, where `W`
is the value given here, and `Ft` is the inverse of user's playtime share of the whole playtime, normalized to 0 and
doubled (`[-1, 1]`). Default `20`
- `PSEUDO_RANDOM_FLOOR`: control the "floor" at which point songs played before can be selected again. Given as an
integer percentage value of the whole pool length. Default `60`
- `PSEUDO_RANDOM_CEILING`: control the "ceiling" at which point songs' weight modifier from being played before is none
(`1`). The modifier changes linearly between `0` at the floor point and `1` in the ceiling point. Default `90`

Please ensure `PSEUDO_RANDOM_FLOOR` is always smaller than `PSEUDO_RANDOM_CEILING`, or prepare wandering into the land
of "undefined behaviour".

You can validate the server is working by going to [`localhost:8080/health`](http://localhost:8080/health) in your 
browser. The server should respond with healthcheck data that looks something like this:

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

### Running the test set

After you have the venv setup, you can install testing requirements by running the following command in
repository root:

```bash
pip install -r server/test_requirements.txt
```

This install both the requirements of the server **and** the requirements for testing (like `pytest`).

After running this command you can run the test set at repository root with the command:

```bash
pytest server
```

### Viewing API documentation

Once the server is running you can visit the [`localhost:8080/docs`](http://localhost:8080/docs) route to 
check the API documentation.


### Logging configuration

Logging can be configured with either environment variables, or through config.json in the server root.

Logging is divided into SQLAlchemy, Uvicorn (FastAPI) and Main loggers. Each has configurable output file, output
stream and logging level. Setting an output stream or file as null means logging is not performed to that source.
This means the following environment variables can be used to overwrite the values in the config file:

 - `MAIN_LOG_FILE` default: `"stagnum_server"`
 - `MAIN_LOG_STREAM` default: `"stdout"`
 - `MAIN_LOG_LEVEL` default: `"DEBUG"`
 - `UVICORN_LOG_FILE` default: `"stagun_server"`
 - `UVICORN_LOG_STREAM` default: `"stdout"`
 - `UVICORN_LOG_LEVEL` default: `"INFO"`
 - `SQLALCHEMY_LOG_FILE` default: `"sqlalchemy"`
 - `SQLALCHEMY_LOG_STREAM` default: `null`
 - `SQLALCHEMY_LOG_LEVEL` default: `"DEBUG"`

## Running with docker

If you don't need to do development work on the server and just want it running to, for
example, test the frontend against it, you can run the server with docker.
You can find detailed instructions for installing Docker from their
["Get started" site](https://www.docker.com/get-started/).

Once you have Docker installed and running on your computer, running the server is as
simple as entering the following commands in the project root.

```bash
docker build -t stagnum-server ./server
docker run -p 8080:8080 \
-e SPOTIFY_CLIENT_ID={client id} \
-e SPOTIFY_CLIENT_SECRET={client secret} \
-e DATABASE_CONNECTION_URL={db url} \
stagnum-server
```

Replace the values in brackets with correct ones. You can also add more environment variables if you wish to customize
the server behaviour. See [running the server](#running-the-server) for full reference on the available environment
variables.

You can browse to [`localhost:8080/health`](http://localhost:8080/health) to verify the server is running. Once again 
a message similar to the following one indicating the server health should be returned:

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

## Running PostgreSQL locally

Please read through the following instructions carefully if you are planning on using PostgreSQL as a local development
database. Basically you need to set up your PostgreSQL server, and then run our alembic migration scripts to apply the
migrations into the server.

### Install and setup PostgreSQL (quick tutorial)

*Note:* you don't need to follow the instructions in this chapter if you already know how to work with PostgreSQL, 
in that case, just set up a local database, and set env variable `DATABASE_CONNECTION_URL` to a conn string for said
database. (`postgresql://postgres:password@localhost:5432/my_database`). Then you can move on to 
[Creating and running migrations](#creating-and-running-migrations)

You can install PostgreSQL from [their website](https://www.postgresql.org/). Install PostgreSQL and pgAdmin 4.
Store your password in your database manager of choice and remember the port you set, or preferably, just use the
default port of 5432.

Run pgAdmin. Add database `stagnum` via pgAdmin. 

Set environment variable `DATABASE_CONNECTION_URL` using the following template. Replace values in curly
braces with your port and password:

```bash
postgresql://postgres:{password}@localhost:{port}/stagnum
```

See [how to set environment variables](#how-to-set-environment-variables) for setting environment variables.

### Creating and running migrations

For now migrations are not automatically ran with the server. This is subject to change as the team explores
alembic more.

All alembic-related commands should be run in the `server` folder.

After you have installed requirements or test requirements in venv and set the environment variable for database
connection string according to the previous chapter, you can run migrations with the following command:

```bash
alembic upgrade head
```

Creating migrations is easy. All you need to do is run the following command after making changes to SQLAlchemy
ORM objects.

```bash
alembic revision --autogenerate -m "My revision message"    
```

Then run the revision using the command above and verify it's working. I suggest removing the comments around
autogenerated code to mark the revision as tested.

## How to set environment variables

Setting an environment variable should be straightforward, here's how to do it with bash and powershell:

```bash
# bash
export DATABASE_CONNECTION_URL="postgresql://postgres:my_pass@localhost:5432/stagnum"
```

```powershell
# Powershell
$Env:DATABASE_CONNECTION_URL = "postgresql://postgres:my_pass@localhost:5432/stagnum"
```
