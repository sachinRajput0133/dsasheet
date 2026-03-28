# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.app_name}-s3-oac"
  description                       = "OAC for ${var.app_name} static assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  comment             = "${var.app_name} distribution"
  default_root_object = ""
  price_class         = "PriceClass_100" # North America + Europe (cheapest)

  # ── Origin 1: S3 (static assets) ─────────────────────────────────────────
  origin {
    origin_id                = "S3-${aws_s3_bucket.static.id}"
    domain_name              = aws_s3_bucket.static.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  # ── Origin 2: EC2 via Nginx (API + SSR) ─────────────────────────────────
  origin {
    origin_id   = "EC2-${var.app_name}"
    domain_name = aws_instance.app.public_dns

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ── Default behavior → EC2 (SSR + API) ───────────────────────────────────
  default_cache_behavior {
    target_origin_id       = "EC2-${var.app_name}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Accept", "Host"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # ── Ordered behavior: /_next/static/* → S3 (immutable cache) ─────────────
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "S3-${aws_s3_bucket.static.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 31536000
    default_ttl = 31536000
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # To use a custom domain + ACM cert, replace with:
    # acm_certificate_arn      = var.acm_certificate_arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = { Name = "${var.app_name}-cf" }
}
