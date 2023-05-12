SHELL=/usr/bin/env bash

SERVER_CONTAINER=server

include .env

.DEFAULT-GOAL=help

help:
	@echo "Makefile for running and managing local dev environment"
	@echo
	@echo "  start"
	@echo "    Starts docker dev environment."
	@echo "  start-prod-server"
	@echo "    Starts docker prod environment."
	@echo "  stop"
	@echo "    Stops docker dev environment."
	@echo "  stop-prod-server"
	@echo "    Stops docker prod environment."
	@echo "  migrate"
	@echo "    Run all DB migrations and create new if models have changed."
	@echo "  gen-ssl-cert"
	@echo "    Generate self-signed cert-key pair and install it on the system."


start:
	@docker compose up -d --build --always-recreate-deps

start-prod-server:
	@docker compose -f ./docker-compose.prod.yml up -d --build --always-recreate-deps

stop:
	@docker compose down

stop-prod-server:
	@docker compose -f ./docker-compose.prod.yml down

migrate:
	@docker compose exec -it $(SERVER_CONTAINER) yarn migrate
	@docker compose exec $(SERVER_CONTAINER) yarn generate-prisma

gen-ssl-cert:
	@./scripts/gen-self-signed-ssl-cert.sh
