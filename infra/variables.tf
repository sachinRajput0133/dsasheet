variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "app_name" {
  description = "Application name prefix for all resources"
  type        = string
  default     = "dsasheet"
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the app server"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Name to give the EC2 key pair"
  type        = string
  default     = "dsasheet-key"
}

variable "ec2_public_key" {
  description = "SSH public key content (paste contents of ~/.ssh/id_rsa.pub)"
  type        = string
}

variable "mongodb_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "jwt_access_secret" {
  description = "JWT access token secret"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret"
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "Allowed CORS origin (your frontend domain)"
  type        = string
  default     = "https://yourdomain.com"
}
