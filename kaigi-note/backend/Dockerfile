# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /usr/src/app

CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload