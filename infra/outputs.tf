output "ec2_public_ip" {
  description = "EC2 public IP — add as EC2_HOST GitHub secret"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 public DNS hostname"
  value       = aws_instance.app.public_dns
}

output "ecr_api_url" {
  description = "ECR repository URL for API image — add as ECR_REGISTRY GitHub secret"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_web_url" {
  description = "ECR repository URL for Web image"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_registry" {
  description = "ECR registry base URL (account.dkr.ecr.region.amazonaws.com)"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "s3_bucket_name" {
  description = "S3 bucket for Next.js static assets — add as S3_BUCKET GitHub secret"
  value       = aws_s3_bucket.static.id
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name (your app URL)"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — add as CLOUDFRONT_DISTRIBUTION_ID GitHub secret"
  value       = aws_cloudfront_distribution.main.id
}

output "github_actions_access_key_id" {
  description = "AWS access key ID for GitHub Actions — add as AWS_ACCESS_KEY_ID GitHub secret"
  value       = aws_iam_access_key.github.id
  sensitive   = true
}

output "github_actions_secret_access_key" {
  description = "AWS secret key for GitHub Actions — add as AWS_SECRET_ACCESS_KEY GitHub secret"
  value       = aws_iam_access_key.github.secret
  sensitive   = true
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ~/.ssh/id_rsa ec2-user@${aws_instance.app.public_ip}"
}

# Helper data source for account ID
data "aws_caller_identity" "current" {}
