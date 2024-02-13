FROM python:3.12

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8080
ENV HOST="0.0.0.0"
ENV PORT="8080"
ENV RELOAD="False"

CMD bash -c "echo 'Starting alembic upgrade!' && alembic upgrade head && echo 'Starting python server!' && python src/main.py"