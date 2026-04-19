FROM python:3.10-slim

WORKDIR /app

# Instalamos dependencias del sistema necesarias para psycopg2 (base de datos)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]