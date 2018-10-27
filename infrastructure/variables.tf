variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "eu-west-1"
}

variable "amis" {
  type = "map"
}

variable "arecords" { type = "list" }
