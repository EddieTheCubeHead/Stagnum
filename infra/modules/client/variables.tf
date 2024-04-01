variable "app_name" {
    description = "The name of the application"
    type = string
}

variable "aws_ecr_repository_url" {
    description = "The url for ecr repository to use"
    type = string
}


variable "aws_ecs_cluster_id" {
    description = "The id for the cluster to use"
    type = string
}

variable "execution_role_arn" {
  description = "The arn for execution role"
  type = string
}

variable "target_group_arn" {
    description = "The arn for target group"
    type = string
}

variable "aws_subnet_a_id" {
    description = "The id of first subnet to use"
    type = string
}


variable "aws_subnet_b_id" {
    description = "The id of second subnet to use"
    type = string
}

variable "aws_security_group_id" {
    description = "The of the aws security group"
    type = string
}

variable "frontend_connection_string"{
    description = "URI to the frontend"
    type = string
}

variable "backend_connection_string"{
    description = "URI to the backend"
    type = string 
}
