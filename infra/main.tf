# Creating an ECS cluster
resource "aws_ecs_cluster" "aws-cluster" {
  name = "${var.app_name}-cluster"
}

# creating an iam policy document for ecsTaskExecutionRole
data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# creating an iam role with needed permissions to execute tasks
resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

# attaching AmazonECSTaskExecutionRolePolicy to ecsTaskExecutionRole
resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

locals {
  frontend_url = "localhost:3000"
  backend_url = "localhost:8080"
  database_url = "localhost:5432"
}

# Creating the task definition
resource "aws_ecs_task_definition" "aws-task" {
  family                   = "${var.app_name}-task" 
  container_definitions    = <<DEFINITION
  [
    {
      "name": "${var.app_name}-front-container",
      "image": "docker.io/eddiethecubehead/stagnum_client:master",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "environment": [
        { "name": "NEXT_PUBLIC_FRONTEND_URI", "value": "${local.frontend_url}" },
        { "name": "NEXT_PUBLIC_BACKEND_URI", "value": "${local.backend_url}" }
      ],
      "memory": 2048,
      "cpu": 256
    },
    {
      "name": "${var.app_name}-back-container",
      "image": "docker.io/eddiethecubehead/stagnum_server:master",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "hostPort": 8080
        }
      ],
      "environment": [
        { "name":"DATABASE_CONNECTION_URL", "value": "postgresql://${var.postgres_user}:${var.postgres_pass}@${local.database_url}/${var.postgres_db}"},
        { "name":"CUSTOM_WEIGHT_SCALE", "value": "${var.custom_weigth_scale}" },
        { "name":"USER_WEIGHT_SCALE", "value": "${var.user_weight_scale}"},
        { "name":"PSEUDO_RANDOM_FLOOR", "value":"${var.pseudo_random_floor}"},
        { "name":"PSEUDO_RANDOM_CEILING", "value": "${var.pseudo_random_ceiling}"}
      ],
      "memory": 2048,
      "cpu": 256
    },
    {
      "name": "${var.app_name}-data-container",
      "image": "public.ecr.aws/docker/library/postgres:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5432,
          "hostPort": 5432
        }
      ],
      "environment":[
        { "name":"POSTGRES_USER", "value": "${var.postgres_user}"},
        { "name":"POSTGRES_PASSWORD","value": "${var.postgres_pass}"},
        { "name":"POSTGRES_DB","value": "${var.postgres_db}"}
      ],
      "memory": 2048,
      "cpu": 256
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048 * 4     # Specifying the memory our task requires
  cpu                      = 256 * 4     # Specifying the CPU our task requires
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn # Stating Amazon Resource Name (ARN) of the execution role
}

# Providing a reference to our default VPC
resource "aws_default_vpc" "default_vpc"{

}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "${var.aws_region}a"
}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "${var.aws_region}b"
}

# Creating a load balancer
resource "aws_alb" "aws-lb" {
  name               = "${var.app_name}-lb" # Naming our load balancer
  load_balancer_type = "application"
  subnets = ["${aws_default_subnet.default_subnet_a.id}","${aws_default_subnet.default_subnet_b.id}"]

  # Referencing the security group
  security_groups = ["${aws_security_group.aws-lb_security_group.id}"]
}

# Creating a security group for the load balancer:
resource "aws_security_group" "aws-lb_security_group" {
  ingress {
    from_port   = 80 # Allowing traffic in from port 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}

# Creating a target group for the load balancer
resource "aws_lb_target_group" "aws-target_group" {
  name        = "target-group"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id # Referencing the default VPC
  health_check {
    matcher = "200,301,302"
    path    = "/"
  }
}

# Creating a listener for the load balancer
resource "aws_lb_listener" "aws-listener" {
  load_balancer_arn = aws_alb.aws-lb.arn # Referencing our load balancer
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.aws-target_group.arn # Referencing our tagrte group
  }
}

# Creating the service
resource "aws_ecs_service" "aws-service" {
  name            = "${var.app_name}-service"                        
  cluster         = aws_ecs_cluster.aws-cluster.id       # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.aws-task.arn # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1 # Setting the number of containers we want deployed to 3

  load_balancer {
    target_group_arn = aws_lb_target_group.aws-target_group.arn # Referencing our target group
    container_name   = "${var.app_name}-front-container"
    container_port   = 3000 # Specifying the container port
  }

  network_configuration {
    subnets = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}"]
    assign_public_ip = true                                                # Providing our containers with public IPs
    security_groups  = ["${aws_security_group.aws-service_security_group.id}"] # Setting the security group
  }
}

# Creating a security group for the service
resource "aws_security_group" "aws-service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = ["${aws_security_group.aws-lb_security_group.id}"]
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}