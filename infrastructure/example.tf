provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

resource "aws_route53_zone" "primary" {
  name = "jandomanski.com"
}

resource "aws_route53_record" "cname" {
  zone_id = "${aws_route53_zone.primary.zone_id}"
  name    = "*.jandomanski.com"
  type    = "CNAME"
  ttl     = "300"
  records = ["jandomanski.com"]
}

resource "aws_route53_record" "www" {
  zone_id = "${aws_route53_zone.primary.zone_id}"
  name    = "jandomanski.com"
  type    = "A"
  ttl     = "300"
  records = [
    "${var.arecords[0]}",
    "${var.arecords[1]}",
    "${var.arecords[2]}",
    "${var.arecords[3]}",
  ]
}

output "nameservers" {
  value = "${aws_route53_record.www.records}"
}
