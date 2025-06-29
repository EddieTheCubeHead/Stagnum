# Most uv + dockerfile functionality borrowed from
# https://depot.dev/docs/container-builds/how-to-guides/optimal-dockerfiles/python-uv-dockerfile

FROM python:3.13 AS base

FROM base AS builder
COPY --from=ghcr.io/astral-sh/uv:0.7.17 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /app
COPY uv.lock pyproject.toml /app/
RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --frozen --no-install-project --no-dev
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --frozen --no-dev

FROM base
COPY --from=builder /app /app
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8080
ENV HOST="0.0.0.0"
ENV PORT="8080"
ENV RELOAD="False"
# Disable logging for sqlalchemy as it's mainly used for local debugging with database
ENV SQLALCHEMY_LOG_FILE=""
ENV SQLALCHEMY_LOG_STREAM=""
# Disable all file-based logging
ENV UVICORN_LOG_FILE=""
ENV MAIN_LOG_FILE=""
CMD bash -c "echo 'Starting alembic upgrade!' && alembic upgrade head && echo 'Starting python server!' && python src/main.py"