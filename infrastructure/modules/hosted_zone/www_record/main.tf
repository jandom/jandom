
resource "aws_route53_record" "www" {
  zone_id = "${var.zone_id}"
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
