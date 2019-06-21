provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

module "hosted_zone" {
   source = "./modules/hosted_zone"
   domain_name = "${var.domain_name}"
   a_records = "${var.a_records}"
}
