FROM python:3.12

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8080
CMD ["uvicorn", "src.main:application", "--host", "0.0.0.0", "--port", "8080"]
