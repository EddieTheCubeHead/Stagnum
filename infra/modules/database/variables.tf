variable "app_name" {
    description = "The name of the application"
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

variable "postgres_user" {
    description = "The public username"
    type = string
}

variable "postgres_pass" {
    description = "The public password"
    type = string
}

variable "postgres_port" {
    description = "The port to use"
    type = string
    default = "5432"
}

variable "postgres_db" {
    description = "The name of the database to use"
    type = string
}