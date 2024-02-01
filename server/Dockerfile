FROM python:3.12

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8080
ENV HOST="0.0.0.0"
ENV PORT="8080"
ENV RELOAD="False"
ENV DATABASE_CONNECTION_STRING="postgres://user:pass@0.0.0.0:5432/Database"
RUN alembic upgrade head
CMD ["python", "src/main.py"]
