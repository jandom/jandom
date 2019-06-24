
resource "aws_route53_zone" "primary" {
  name = "${var.domain_name}"
}

module "www_record" {
   source = "./www_record"
   zone_id = "${aws_route53_zone.primary.zone_id}"
   domain_name = "${var.domain_name}"
   a_records = "${var.a_records}"
}

module "cname_record" {
   source = "./cname_record"
   zone_id = "${aws_route53_zone.primary.zone_id}"
   domain_name = "${var.domain_name}"
}
