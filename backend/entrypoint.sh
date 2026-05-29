#!/bin/bash
set -e

echo "Waiting for PostgreSQL to start..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started."

echo "Waiting for Redis to start..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis started."

if [ "$1" = "python" ]; then
  echo "Applying database migrations..."
  python manage.py migrate
fi

exec "$@"
