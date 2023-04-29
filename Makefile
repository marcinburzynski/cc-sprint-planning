SHELL=/usr/bin/env bash

SOCKET_CONTAINER=socket

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
	@echo "  migrate"
	@echo "    Run all DB migrations and create new if models have changed."


start:
	@docker-compose up -d --build --always-recreate-deps

start-prod-server:
	@docker-compose -f ./docker-compose.prod.yml up -d --build --always-recreate-deps

stop:
	@docker-compose down

migrate:
	@docker-compose exec -it $(SOCKET_CONTAINER) yarn migrate

