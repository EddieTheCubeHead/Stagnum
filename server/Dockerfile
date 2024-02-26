FROM python:3.12

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .
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