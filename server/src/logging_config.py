import json
import os
import sys
from logging import DEBUG, INFO, WARNING, ERROR, CRITICAL, FileHandler, Handler, Formatter, StreamHandler, getLogger
from typing import Any

# Borrowed from my own project: ClusterBot (see EddieTheCubeHead in github)  - Eetu

_LOG_LEVELS = {
    "DEBUG": DEBUG,
    "INFO": INFO,
    "WARNING": WARNING,
    "ERROR": ERROR,
    "CRITICAL": CRITICAL
}

_LOG_STREAMS = {
    "stdout": sys.stdout,
    "stderr": sys.stderr
}

_FILE_HANDLERS: dict[str, FileHandler] = {}


def get_config(config_name: str) -> str | int:
    config = os.getenv(config_name, None)
    if config is None:
        file_path = os.path.join(os.path.dirname(__file__), "./config.json")
        with open(file_path, "r", encoding="utf-8") as config_file:
            config = json.loads(config_file.read())[config_name]
    return config


class LoggingConfiguration:

    def __init__(self, log_file: str, log_stream: str, log_level: str):
        self.log_file = log_file
        self.log_stream = _LOG_STREAMS.get(log_stream, None)
        self.log_level = _LOG_LEVELS[log_level]


def _build_configuration_from_config(log_type: str) -> LoggingConfiguration:
    log_file = get_config(f"{log_type}_log_file".upper()) + ".log"
    log_stream = get_config(f"{log_type}_log_stream".upper())
    log_level = get_config(f"{log_type}_log_level".upper())
    return LoggingConfiguration(log_file, log_stream, log_level)


def _get_formatter(handler: Handler) -> Formatter:
    if not isinstance(handler, FileHandler):
        if isinstance(handler, StreamHandler) and stream_supports_colour(handler.stream):
            return _ColourFormatter()
    dt_fmt = "%Y-%m-%d %H:%M:%S"
    return Formatter("{asctime} {levelname:<8} {name:<32} {message}", dt_fmt, style="{")


def _ensure_file(file_name: str):
    with open(file_name, "w") as _:
        pass


def _get_file_handler(file_name: str) -> FileHandler:
    if file_name not in _FILE_HANDLERS:
        _ensure_file(file_name)
        _FILE_HANDLERS[file_name] = FileHandler(file_name)
    return _FILE_HANDLERS[file_name]


def _build_logger(log_type: str):
    log_config = _build_configuration_from_config(log_type)
    stream_handler = None
    if log_config.log_stream is not None:
        stream_handler = StreamHandler(log_config.log_stream)
        stream_handler.setFormatter(_get_formatter(stream_handler))
    file_handler = None
    if log_config.log_file is not None:
        file_handler = _get_file_handler(log_config.log_file)
        file_handler.setFormatter(_get_formatter(file_handler))
    logger = getLogger(log_type.lower())
    logger.setLevel(log_config.log_level)
    if stream_handler is not None:
        logger.addHandler(stream_handler)
    if file_handler is not None:
        logger.addHandler(file_handler)


def setup_logging():
    _build_logger("main")
    _build_logger("uvicorn")
    _build_logger("sqlalchemy")
    getLogger("main.logging").debug("Logging set up successfully")


# The code from this row onwards is borrowed from discord.py library source code (logging/utils)
# It is used here to add colour into logs in console.
# discord.py uses MIT license and has the following license statement:

"""
The MIT License (MIT)

Copyright (c) 2015-present Rapptz

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
"""


def is_docker() -> bool:
    path = '/proc/self/cgroup'
    return os.path.exists('/.dockerenv') or (os.path.isfile(path) and any('docker' in line for line in open(path)))


def stream_supports_colour(stream: Any) -> bool:
    is_a_tty = hasattr(stream, 'isatty') and stream.isatty()

    # Pycharm and Vscode support colour in their inbuilt editors
    if 'PYCHARM_HOSTED' in os.environ or os.environ.get('TERM_PROGRAM') == 'vscode':
        return True

    if sys.platform != 'win32':
        # Docker does not consistently have a tty attached to it
        return is_a_tty or is_docker()

    # ANSICON checks for things like ConEmu
    # WT_SESSION checks if this is Windows Terminal
    return is_a_tty and ('ANSICON' in os.environ or 'WT_SESSION' in os.environ)


class _ColourFormatter(Formatter):

    # ANSI codes are a bit weird to decipher if you're unfamiliar with them, so here's a refresher
    # It starts off with a format like \x1b[XXXm where XXX is a semicolon separated list of commands
    # The important ones here relate to colour.
    # 30-37 are black, red, green, yellow, blue, magenta, cyan and white in that order
    # 40-47 are the same except for the background
    # 90-97 are the same but "bright" foreground
    # 100-107 are the same as the bright ones but for the background.
    # 1 means bold, 2 means dim, 0 means reset, and 4 means underline.

    LEVEL_COLOURS = [
        (DEBUG, '\x1b[37;1m'),
        (INFO, '\x1b[34;1m'),
        (WARNING, '\x1b[33;1m'),
        (ERROR, '\x1b[31m'),
        (CRITICAL, '\x1b[41m'),
    ]

    FORMATS = {
        level: Formatter(
            f'\x1b[30;1m%(asctime)s\x1b[0m {colour}%(levelname)-8s\x1b[0m \x1b[35m%(name)-32s\x1b[0m %(message)s',
            '%Y-%m-%d %H:%M:%S',
        )
        for level, colour in LEVEL_COLOURS
    }

    def format(self, record):
        formatter = self.FORMATS.get(record.levelno)
        if formatter is None:
            formatter = self.FORMATS[DEBUG]

        # Override the traceback to always print in red
        if record.exc_info:
            text = formatter.formatException(record.exc_info)
            record.exc_text = f'\x1b[31m{text}\x1b[0m'

        output = formatter.format(record)

        # Remove the cache layer
        record.exc_text = None
        return output

# Borrowed code ends
