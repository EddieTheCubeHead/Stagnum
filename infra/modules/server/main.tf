# Creating the task definition
resource "aws_ecs_task_definition" "back" {
  family                   = "${var.app_name}-back" 
  container_definitions    = jsonencode([
    {
        name : "${var.app_name}-back",
        image : "${var.aws_ecr_repository_url}/back:latest",
        essential = true,
        portMappings : [{
            containerPort: 8080,
            hostPort: 8080
        }],
        environment : [{
            DATABASE_CONNECTION_URL : var.database_connection_string,
            SPOTIFY_CLIENT_ID : var.spotify_client_id
            SPOTIFY_CLIENT_SECRET : var.spotify_client_secret
        }],
        memory : 512
        cpu : 256
    }
  ])
  

  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 512     # Specifying the memory our task requires
  cpu                      = 256     # Specifying the CPU our task requires
  execution_role_arn       = var.execution_role_arn # Stating Amazon Resource Name (ARN) of the execution role
}

# Creating the service
resource "aws_ecs_service" "back" {
  name            = "${var.app_name}-back"                        
  cluster         = var.aws_ecs_cluster.id       # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.back.arn # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1 # Setting the number of containers we want deployed to 3

  load_balancer {
    target_group_arn = var.target_group_arn # Referencing our target group
    container_name   = aws_ecs_task_definition.back.container_definitions.name
    container_port   = 8080 # Specifying the container port
  }

  network_configuration {
    subnets = [var.aws_subnet_a_id, var.aws_subnet_b_id]
    assign_public_ip = true                                                 # Providing our containers with public IPs
    security_groups  = [var.aws_security_group_id] # Setting the security group
  }
}