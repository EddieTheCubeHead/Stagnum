# Stagnum server

- [Development setup](#development-setup)
  - [Installing python](#installing-python)
  - [Creating a virtual environment](#creating-a-virtual-environment)
  - [Installing dependencies](#installing-dependencies)
  - [Running the server](#running-the-server)
- [Running with docker](#running-with-docker)

## Development setup

### Installing python

Development is conducted in python 3.12. You can download it from
[the official python website](https://www.python.org/downloads/).

### Creating a virtual environment

It's recommended to create a virtual environment for each python program you run locally.
This prevents the packages you install from polluting the global package pool and prevents
having multiple versions of the same package installed.

You need to use the correct python executable to create the venv, as the executable used
will become the interpreter for the venv created. You can check the version with

```
python -V
```

`python` uses python version from `PATH` in your computer. You can have multiple versions
installed. Pointing to `python.exe` in the installation root directly lets you choose which
version to use. For example on windows you could do:

```
C:\Users\user\AppData\Local\Programs\Python\Python311\python.exe -V
>>> 3.11.7

C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe -V
>>> 3.12.1
```

To create a venv, execute the command.

```
path-to-python-3-12-executable -m venv ./.venv
```

Then, you can use the following command to activate the venv (please choose the correct
script depending on the type of your terminal, this one is for shell!)

```
.venv/Scripts/activate
```

If the venv was activated correctly you should see line feeds start with `(venv)` in your
terminal.

### Installing dependencies

You can install dependencies by running

```
pip install -r server/requirements.txt
```

In the repository root. Leave the `server/` -part out if you are working directly in the
server folder.

### Running the server

The server is run using `uvicorn`. Once you have installed the dependencies you can use
one of the following commands to run the server locally, depending on your working
directory.

```
// Working in project root
uvicorn server.src.main:application --reload

// Working in server folder
uvicorn src.main:application --reload
```

The `--reload` argument causes the server to reload on code changes enabling live testing
during development. If you prefer to manually restart the server instead, you can omit the
argument.

You can validate the server is working by going to `localhost:8000` in your browser. The
server should respond with the following message:

```json
{
  "message": "Hello world"
}
```

## Running with docker

If you don't need to do development work on the server and just want it running to, for
example, test the backend, it is recommended to run the server with docker. You can find
detailed instructions for installing Docker from their
[Get started -site](https://www.docker.com/get-started/).

Once you have Docker installed and running on your computer, running the server is as
simple as entering the following commands in the project root.

```
docker build -t stagnum-server ./server
docker run -p 8080:8080 stagnum-server
```

You can browse to `localhost:8080` to verify the server is running. Once again the
following message is returned, if everything works correctly:

```json
{
  "message": "Hello world"
}
```
