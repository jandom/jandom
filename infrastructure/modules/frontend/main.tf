resource "aws_s3_bucket" "bucket" {
  bucket = "${var.bucket_name}"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_route53_record" "www" {
  zone_id = "${var.zone_id}"
  name    = "production.jandomanski.com"
  type    = "A"

  alias {
    name                   = "${aws_s3_bucket.bucket.website_endpoint}"
    zone_id                = "${aws_s3_bucket.bucket.hosted_zone_id}"
    evaluate_target_health = true
  }
}

output "blah" {
  value = "${aws_s3_bucket.bucket}"
}
