provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

module "hosted_zone" {
   source = "../modules/hosted_zone"
   domain_name = "${var.domain_name}"
   a_records = "${var.a_records}"
}

terraform {
  backend "s3" { # https://medium.com/@mitesh_shamra/state-management-with-terraform-9f13497e54cf
    bucket         = "jandomanski-homepage"
    region         = "eu-west-1"
    profile        = "jandom-personal"
    key            = "terraform.tfstate"
    dynamodb_table = "jandomanski-homepage-terraform" # to prevent race conditions, table needs to be created manually
  }
}