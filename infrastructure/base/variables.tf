variable "access_key" {}

variable "secret_key" {}

variable "region" {
  default = "eu-west-1"
}

variable "amis" {
  type = "map"
}

variable "a_records" { type = "list" }

variable "domain_name" {}
