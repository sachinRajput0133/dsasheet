# Terraform Commands — DSAsheet Infrastructure

## Prerequisites

- AWS CLI configured (`aws configure list` to verify)
- Terraform >= 1.6 installed
- S3 bucket and DynamoDB table for remote state must exist (one-time manual setup)

### One-time remote state setup (run once ever)

```bash
aws s3 mb s3://dsasheet-terraform-state --region ap-south-1
aws dynamodb create-table \
  --table-name dsasheet-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

---

## First Time Setup

### 1. Initialize Terraform (downloads providers, connects to S3 backend)

```bash
cd infra
terraform init
```

Run this once, or again whenever you add/change providers.

### 2. Preview what will be created

```bash
terraform plan
```

Shows a dry run — no real resources created. Read this before every apply.

### 3. Apply (create all AWS resources)

```bash
terraform apply
```

Terraform asks for confirmation. Type `yes` to proceed.

To skip the confirmation prompt:

```bash
terraform apply -auto-approve
```

---

## After Apply — Get GitHub Secrets

After every `terraform apply`, update these GitHub secrets:

```bash
# AWS credentials for GitHub Actions
terraform output -raw github_actions_access_key_id
terraform output -raw github_actions_secret_access_key

# Other values (not sensitive, shown normally)
terraform output
```

| GitHub Secret | Terraform Output |
|---|---|
| `AWS_ACCESS_KEY_ID` | `github_actions_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | `github_actions_secret_access_key` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |
| `EC2_HOST` | `ec2_public_ip` |
| `S3_BUCKET` | `s3_bucket_name` |
| `NEXT_PUBLIC_API_URL` | `http://<ec2_public_ip>/api/v1` |
| `EC2_SSH_KEY` | contents of `~/.ssh/id_rsa` |

> **Note:** `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` change every time you destroy + apply because a new IAM user is created. Update GitHub secrets after every re-apply.

---

## Day-to-Day Commands

### See current state (all resources terraform is managing)

```bash
terraform show
```

### See only the output values

```bash
terraform output
```

### See a specific output value (raw, no quotes — safe to copy/paste)

```bash
terraform output -raw <output_name>
# Example:
terraform output -raw github_actions_access_key_id
```

### Format all .tf files (fix indentation/style)

```bash
terraform fmt
```

### Validate config syntax without connecting to AWS

```bash
terraform validate
```

### Refresh state (sync terraform state with actual AWS resources)

```bash
terraform refresh
```

### See what will be destroyed before destroying

```bash
terraform plan -destroy
```

---

## Destroy Infrastructure

### Destroy everything (deletes all AWS resources)

```bash
terraform destroy
```

> **Warning:** This deletes EC2, ECR, S3, CloudFront, VPC — everything. Your app goes down.

To skip confirmation:

```bash
terraform destroy -auto-approve
```

### Destroy only a specific resource

```bash
terraform destroy -target=aws_instance.app
```

---

## Partial Apply / Targeting

### Apply only a specific resource (useful when one thing changed)

```bash
terraform apply -target=aws_instance.app
terraform apply -target=aws_security_group.ec2
```

---

## State Management (advanced)

### List all resources in state

```bash
terraform state list
```

### Inspect a specific resource in state

```bash
terraform state show aws_instance.app
```

### Remove a resource from state without deleting it from AWS

```bash
terraform state rm aws_instance.app
```

Useful if you want terraform to stop managing a resource without actually deleting it.

### Import an existing AWS resource into terraform state

```bash
terraform import aws_instance.app <instance-id>
```

---

## Typical Full Workflow

```bash
# 1. Go to infra directory
cd infra

# 2. Init (first time or after provider changes)
terraform init

# 3. Preview
terraform plan

# 4. Apply
terraform apply

# 5. Get secrets for GitHub
terraform output -raw github_actions_access_key_id
terraform output -raw github_actions_secret_access_key
terraform output

# 6. SSH into server
ssh -i ~/.ssh/id_rsa ec2-user@$(terraform output -raw ec2_public_ip)
```
