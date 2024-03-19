variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_region" { default = "eu-north-1" }
variable "app_environment" { default = "prod" }
variable "app_name" { default = "stagnum" }
variable "aws_subnet_a" {default = "eu-north-1a"}
variable "aws_subnet_b" {default = "eu-north-1b"}
variable "FRONTEND_PORT" {}
variable "BACKEND_PORT" {}
variable "DATABASE_PORT" {}
variable "POSTGRES_USER" {}
variable "POSTGRES_PASSWORD" {}
variable "POSTGRES_DB" {} 
variable "NEXT_PUBLIC_FRONTEND_URI" {}
variable "NEXT_PUBLIC_BACKEND_URI" {}