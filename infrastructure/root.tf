provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

resource "aws_route53_zone" "primary" {
  name = "${var.domain_name}"
}

resource "aws_route53_record" "cname" {
  zone_id = "${aws_route53_zone.primary.zone_id}"
  name    = "*.${var.domain_name}"
  type    = "CNAME"
  ttl     = "300"
  records = ["${var.domain_name}"]
}

resource "aws_route53_record" "www" {
  zone_id = "${aws_route53_zone.primary.zone_id}"
  name    = "${var.domain_name}"
  type    = "A"
  ttl     = "300"
  records = [
    "${var.a_records[0]}",
    "${var.a_records[1]}",
    "${var.a_records[2]}",
    "${var.a_records[3]}",
  ]
}

output "nameservers" {
  value = "${aws_route53_zone.primary.name_servers}"
}
