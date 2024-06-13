variable "aws_region" {
  description = "The AWS region where the resource is deployed"
  type        = string
  default     = "eu-north-1"
}

variable "app_environment" {
  description = "The name of aws environment to be deployed"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "stagnum"
}

variable "aws_access_key" {
  description = "The aws access key"
  sensitive   = true
  type        = string
}

variable "aws_secret_key" {
  description = "The aws secret key"
  sensitive   = true
  type        = string
}
/*
variable "spotify_client_id" {
  description = "The Spotify client id"
  sensitive   = true
  type        = string
}

variable "spotify_client_secret" {
  description = "The Spotify client secret"
  sensitive   = true
  type        = string
}
*/
