terraform {
  backend "s3" {
    bucket = "stagnum-tfstate-bucket"
    key = "state/terraform.tfstate"
    region = "eu-north-1"
    encrypt = true
    dynamodb_table = "stagnum-tf-lockid"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}
