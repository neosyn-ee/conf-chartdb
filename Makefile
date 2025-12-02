.PHONY: help up down logs stop restart build clean

help:
	@echo "Available commands:"
	@echo "  make up       - Start containers"
	@echo "  make down     - Stop and remove containers"
	@echo "  make build    - Build images"
	@echo "  make logs     - View logs"
	@echo "  make stop     - Stop containers"
	@echo "  make restart  - Restart containers"
	@echo "  make clean    - Remove containers, volumes and images"

up:
	docker-compose -f docker-compose.yml --env-file ./.env up -d

down:
	docker-compose down

build:
	docker-compose -f docker-compose.yml --env-file ./.env up --build -d

logs:
	docker-compose logs -f

stop:
	docker-compose stop

restart: down up

clean:
	docker-compose down -v --rmi all