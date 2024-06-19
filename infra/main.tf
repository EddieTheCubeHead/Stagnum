locals {
  azs = ["eu-north-1a"]
  tags = {
    Terraform   = "true"
    Environment = "Prod"
    Project     = "Stagnum"
    Service     = "Stagnum"
  }
  data_inputs = {
    # TODO: Set values
    ebs_name              = "nvme1n1"
    frontend_port         = "80"
    backend_port          = "8080"
    postgres_port         = "5432"
    frontend_uri          = "http://localhost:80"
    backend_uri           = "http://localhost:8080"
    postgres_user         = "root"
    postgres_pass         = "pass"
    postgres_db           = "data"
    spotify_client_id     = ""
    spotify_client_secret = ""
    enviroment            = "PRODUCTION"
    custom_weight_scale   = "5"
    user_weight_scale     = "20"
    pseudu_random_floor   = "60"
    pseudo_random_ceiling = "90"
  }
}

########################################################
# Networking
########################################################

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "Stagnum-vpc"
  cidr = "10.0.0.0/16"

  azs             = local.azs
  private_subnets = []
  public_subnets  = ["10.0.1.0/24"]

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = local.tags
}

module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "Stagnum-security-group"
  description = "Security group for stagnum"
  vpc_id      = module.vpc.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]
  ingress_rules       = ["http-80-tcp", "https-443-tcp", "all-icmp", "ssh-tcp"]
  egress_rules        = ["all-all"]

  tags = local.tags
}


########################################################
# EC2
########################################################

module "ec2_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "~> 5.0"

  name          = "Stagnum-stack"
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  key_name                    = "deployer-key"
  monitoring                  = true
  vpc_security_group_ids      = [module.security_group.security_group_id]
  subnet_id                   = element(module.vpc.public_subnets, 0)
  availability_zone           = element(local.azs, 0)
  associate_public_ip_address = true
  user_data                   = templatefile("${path.root}/config/userdata.tftpl", local.data_inputs)

  tags       = local.tags
  depends_on = [aws_key_pair.deployer]
}

resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOgP6TjSCjZS/VWhixYYevHGdzVN4jmlT5KH9va5CiBs elias.samuli@gmail.com"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_ebs_volume" "posrgres" {
  availability_zone = module.ec2_instance.availability_zone
  size              = 10
  type              = "gp3"

  tags = merge({ name : "Stagnum-postgers" }, local.tags)
}

resource "aws_volume_attachment" "this" {
  device_name = "/dev/sdd"
  volume_id   = aws_ebs_volume.posrgres.id
  instance_id = module.ec2_instance.id
}

########################################################
# Route 53
########################################################

resource "aws_route53_zone" "primary" {
  name = "stagnum.com"
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.stagnum.com"
  type    = "A"
  ttl     = 300
  records = [module.ec2_instance.public_ip]
}

resource "aws_route53_record" "main" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "stagnum.com"
  type    = "A"
  ttl     = 300
  records = [module.ec2_instance.public_ip]
}
