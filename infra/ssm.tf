resource "aws_ssm_parameter" "mongodb_uri" {
  name        = "/${var.app_name}/MONGODB_URI"
  description = "MongoDB Atlas connection string"
  type        = "SecureString"
  value       = var.mongodb_uri

  tags = { Name = "${var.app_name}-mongodb-uri" }
}

resource "aws_ssm_parameter" "jwt_access_secret" {
  name        = "/${var.app_name}/JWT_ACCESS_SECRET"
  description = "JWT access token signing secret"
  type        = "SecureString"
  value       = var.jwt_access_secret

  tags = { Name = "${var.app_name}-jwt-access" }
}

resource "aws_ssm_parameter" "jwt_refresh_secret" {
  name        = "/${var.app_name}/JWT_REFRESH_SECRET"
  description = "JWT refresh token signing secret"
  type        = "SecureString"
  value       = var.jwt_refresh_secret

  tags = { Name = "${var.app_name}-jwt-refresh" }
}

resource "aws_ssm_parameter" "cors_origin" {
  name        = "/${var.app_name}/CORS_ORIGIN"
  description = "Allowed CORS origin"
  type        = "String"
  value       = var.cors_origin

  tags = { Name = "${var.app_name}-cors-origin" }
}
