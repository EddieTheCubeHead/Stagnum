# Creating an ECR Repository
resource "aws_ecr_repository" "ecr-repo"{
  name = "${var.app_name}-repo"
  force_delete = true
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

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


# Providing a reference to our default VPC
resource "aws_vpc" "default"{
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.default.id
  map_public_ip_on_launc = true
}

resource "aws_subnet" "private" {
  vpc_id = aws_vpc.default.id
}

resource "aws_internet_gateway" "gateway" {
  vpc_id = aws_vpc.default.id
  
}

resource "aws_route" "internet_access" {
  route_table_id = aws_vpc.default.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.gateway.id
  
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


# Creating a security group for the services
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

module "data" {
  source = "./modules/database"
  app_name = var.app_name
  aws_security_group_id = aws_security_group.aws-service_security_group.id
  aws_subnet_a_id = aws_default_subnet.default_subnet_a.id
  aws_subnet_b_id = aws_default_subnet.default_subnet_b.id
  aws_ecs_cluster_id = aws_ecs_cluster.aws_ecs_cluster.id
  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
  target_group_arn = aws_security_group.aws-service_security_group.id
  postgres_user = var.postgres_user
  postgres_pass = var.postgres_pass
  postgres_db = var.postgres_db
  postgres_port = "5432"
}

module "back" {
  source = "./modules/server"
  app_name = var.app_name
  aws_security_group_id = aws_security_group.aws-service_security_group.id
  aws_subnet_a_id = aws_default_subnet.default_subnet_a.id
  aws_subnet_b_id = aws_default_subnet.default_subnet_b.id
  aws_ecs_cluster_id = aws_ecs_cluster.aws-cluster.id
  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
  target_group_arn = aws_security_group.aws-service_security_group.id
  aws_ecr_repository_url = aws_ecr_repository.ecr-repo.repository_url
  database_connection_string = module.data.database_connection_string
  spotify_client_id = var.spotify_client_id
  spotify_client_secret = var.spotify_client_secret
}

module "front" {
  source = "./modules/client"
  app_name = var.app_name
  aws_security_group_id = aws_security_group.aws-service_security_group.id
  aws_subnet_a_id = aws_default_subnet.default_subnet_a.id
  aws_subnet_b_id = aws_default_subnet.default_subnet_b.id
  aws_ecs_cluster_id = aws_ecs_cluster.aws-cluster.id
  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
  target_group_arn = aws_security_group.aws-service_security_group.id
  aws_ecr_repository_url = aws_ecr_repository.ecr-repo.repository_url
  frontend_connection_string = module.front.connection_string
  backend_connection_string = module.back.connection_string
}