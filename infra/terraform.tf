terraform {
#    backend "s3" {
#        bucket = var.app_name
#        key = var.aws_access_key
#        region = var.aws_region
#    }

    required_providers {
      aws = {
        source = "hashicorp/aws"
        version = "~> 5.0"
      }
    }
}

provider "aws" {
    region = var.aws_region
    access_key = var.aws_access_key
    secret_key = var.aws_secret_key
}
