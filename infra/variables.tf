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

variable "postgres_user" {
  description = "The username for the database to use"
  type        = string
}

variable "postgres_pass" {
  description = "The password for the database to use"
  sensitive   = true
  type        = string
}

variable "postgres_db" {
  description = "The database to use"
  sensitive   = false
  type        = string
}

variable "custom_weigth_scale" {
  description = "Custom weight for the backend. This is a weight of how much the user_weight_scale affects"
  default     = 5
  type        = number
}

variable "user_weight_scale" {
  description = "Users weight for backend. How much users playtime affects the algorithm"
  default     = 20
  type        = number
}

variable "pseudo_random_floor" {
  description = "Floor for the sorting algorithm"
  default     = 60
  type        = number
}

variable "pseudo_random_ceiling" {
  description = "Ceiling for the sorting algorithm"
  default     = 90
  type        = number
}

variable "verbose_sqlalchemy" {
  description = "Should the sqlalchemy be verbose"
  default     = false
  type        = bool
}

variable "cors_origins" {
  description = "The Cors for the backend to use"
  default     = "*"
  type        = string
}

variable "environment" {
  description = "The environment to run the containers"
  default     = "production"
  type        = string
}