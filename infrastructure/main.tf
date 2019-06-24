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

terraform {
  backend "s3" { # will handle correctly multiple workspaces
    bucket         = "jandomanski-homepage"
    region         = "eu-west-1"
    profile        = "jandom-personal"
    key            = "terraform.tfstate"
    dynamodb_table = "jandomanski-homepage-terraform" # to prevent race conditions, table needs to be created manually
  }
}


data "terraform_remote_state" "network" {
  backend = "s3" # bucket needs to be created manually
  config {
    bucket = "jandomanski-homepage"
    key    = "terraform.tfstate"
    region = "eu-west-1" # make sure terraform has permissions
  }
}
