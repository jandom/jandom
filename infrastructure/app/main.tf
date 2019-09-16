provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

terraform {
  backend "s3" { # https://medium.com/@mitesh_shamra/state-management-with-terraform-9f13497e54cf
    bucket         = "jandomanski-homepage"
    region         = "eu-west-1"
    profile        = "jandom-personal"
    key            = "app.tfstate"
    dynamodb_table = "jandomanski-homepage-terraform" # to prevent race conditions, table needs to be created manually
  }
}

data "terraform_remote_state" "base" {
  backend = "s3"
  config = { # remote state https://stackoverflow.com/questions/50820850/terraform-s3-backend-vs-terraform-remote-state
    bucket = "jandomanski-homepage"
    key    = "terraform.tfstate"
    region = "eu-west-1"
    profile = "jandom-personal"
  }
}

module "frontend_production" {
   source = "../modules/frontend"
   bucket_name = "production.jandomanski.com"
   zone_id = "${data.terraform_remote_state.base.outputs.hosted_zone.zone_id}"
}

output "blah" {
  value = "${module.frontend_production}"
}
