.DEFAULT_GOAL := help

COMPOSE := docker compose

.PHONY: help dev build start lint prisma-generate prisma-migrate prisma-deploy db-up db-down seed deploy

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z0-9_.-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

dev: ## Inicia Next.js en modo desarrollo
	npm run dev

build: ## Genera build de produccion
	npm run build

start: ## Levanta servidor de produccion
	npm run start

lint: ## Ejecuta linter
	npm run lint

prisma-generate: ## Genera cliente Prisma
	npm run prisma:generate

prisma-migrate: ## Ejecuta migraciones de desarrollo
	npm run prisma:migrate

prisma-deploy: ## Aplica migraciones en produccion (migrate deploy)
	npm run prisma:deploy

db-up: ## Levanta PostgreSQL (docker compose)
	$(COMPOSE) up -d

db-down: ## Para PostgreSQL
	$(COMPOSE) down

seed: ## Carga datos de ejemplo
	npm run prisma:seed

deploy: ## Despliega en servidor (npm ci* + migrate deploy + build + restart)
	@echo "[deploy] Ejecutando scripts/remote-deploy.sh en $(CURDIR)"
	@echo "[deploy] Servicio systemd: $${DEPLOY_SERVICE:-sabhoy}"
	DEPLOY_PATH="$(CURDIR)" SERVICE_NAME="$${DEPLOY_SERVICE:-sabhoy}" bash ./scripts/remote-deploy.sh
