# Creating the task definition
resource "aws_ecs_task_definition" "front" {
  family                   = "${var.app_name}-front" 
  container_definitions    = jsonencode([
    {
        name : "${var.app_name}-front",
        image : "${var.aws_ecr_repository_url}/front:latest",
        essential = true,
        portMappings : [{
            containerPort: 3000,
            hostPort: 3000
        }],
        environment : [{
            NEXT_PUBLIC_FRONTEND_URI : var.frontend_connection_string,
            NEXT_PUBLIC_BACKEND_URI : var.backend_connection_string
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
resource "aws_ecs_service" "front" {
  name            = "${var.app_name}-front"                        
  cluster         = var.aws_ecs_cluster_id       # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.front.arn # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1 # Setting the number of containers we want deployed to 3

  load_balancer {
    target_group_arn = var.target_group_arn # Referencing our target group
    container_name   = aws_ecs_task_definition.front.container_definitions.name
    container_port   = 3000 # Specifying the container port
  }

  network_configuration {
    subnets = [var.aws_subnet_a_id, var.aws_subnet_b_id]
    assign_public_ip = true                                                 # Providing our containers with public IPs
    security_groups  = [var.aws_security_group_id] # Setting the security group
  }
}
