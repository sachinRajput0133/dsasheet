.PHONY: install dev build lint test seed docker-dev docker-prod down clean \
        tf-init tf-plan tf-apply tf-destroy tf-output tf-state-bootstrap

# ─── Setup ────────────────────────────────────────────────────────────────────
install:
	pnpm install

# ─── Development ──────────────────────────────────────────────────────────────
dev:
	pnpm dev

api:
	pnpm api

web:
	pnpm web

# ─── Build ────────────────────────────────────────────────────────────────────
build:
	pnpm build

# ─── Quality ──────────────────────────────────────────────────────────────────
lint:
	pnpm lint

test:
	pnpm test

# ─── Database ─────────────────────────────────────────────────────────────────
seed:
	pnpm seed

# ─── Docker ───────────────────────────────────────────────────────────────────
docker-dev:
	docker compose -f docker-compose.dev.yml up --build

docker-prod:
	docker compose up --build -d

down:
	docker compose down

down-dev:
	docker compose -f docker-compose.dev.yml down

# ─── Terraform ────────────────────────────────────────────────────────────────
# One-time: create S3 state bucket + DynamoDB lock table
tf-state-bootstrap:
	aws s3 mb s3://dsasheet-terraform-state --region ap-south-1 || true
	aws dynamodb create-table \
	  --table-name dsasheet-terraform-lock \
	  --attribute-definitions AttributeName=LockID,AttributeType=S \
	  --key-schema AttributeName=LockID,KeyType=HASH \
	  --billing-mode PAY_PER_REQUEST \
	  --region ap-south-1 || true
	@echo "State backend ready"

tf-init:
	cd infra && terraform init

tf-plan:
	cd infra && terraform plan -var-file=terraform.tfvars

tf-apply:
	cd infra && terraform apply -var-file=terraform.tfvars

tf-destroy:
	cd infra && terraform destroy -var-file=terraform.tfvars

tf-output:
	cd infra && terraform output

# ─── Cleanup ──────────────────────────────────────────────────────────────────
clean:
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name ".next" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
	@echo "Cleaned all build artifacts and node_modules"
