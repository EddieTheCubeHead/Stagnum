locals {
  azs = ["eu-north-1a"]
  tags = {
    Terraform   = "true"
    Environment = "Prod"
    Project     = "Stagnum"
    Service     = "Stagnum"
  }
  data_inputs = {

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
  ingress_rules       = ["http-80-tcp", "https-443-tcp", "all-icmp"]
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

  key_name                    = "user1"
  monitoring                  = true
  vpc_security_group_ids      = [module.security_group.security_group_id]
  subnet_id                   = element(module.vpc.public_subnets, 0)
  availability_zone           = element(local.azs, 0)
  associate_public_ip_address = true
  user_data                   = templatefile("${path.root}/config/userdata.tftpl", local.data_inputs)

  tags = local.tags
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

  tags = local.tags
}

resource "aws_volume_attachment" "this" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.posrgres.id
  instance_id = module.ec2_instance.id
}
