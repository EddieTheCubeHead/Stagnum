locals {
  azs = ["eu-north-1a"]
  tags = {
    Terraform   = "true"
    Environment = "Prod"
    Project     = "Stagnum"
    Service     = "Stagnum"
  }
  data_inputs = {
    ebs_name              = "nvme1n1"
    frontend_port         = var.frontend_port
    backend_port          = var.backend_port
    postgres_port         = var.postgres_port
    frontend_uri          = "https://${var.domain}"
    backend_uri           = "https://back.${var.domain}"
    arn_role              = module.iam_assumable_role.iam_role_arn
    route53_zone          = aws_route53_zone.primary.zone_id
    le_email              = var.le_email
    postgres_user         = var.postgres_user
    postgres_pass         = var.postgres_pass
    postgres_db           = var.postgres_db
    spotify_client_id     = var.spotify_client_id
    spotify_client_secret = var.spotify_client_secret
    enviroment            = var.app_environment
    custom_weight_scale   = var.custom_weigth_scale
    user_weight_scale     = var.user_weight_scale
    pseudu_random_floor   = var.pseudo_random_floor
    pseudo_random_ceiling = var.pseudo_random_ceiling
    region                = data.aws_region.current.name
    domain                = var.domain
  }
}
data "aws_region" "current" {}

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
  user_data_replace_on_change = true
  iam_instance_profile        = module.iam_assumable_role.iam_instance_profile_name
  metadata_options = {
    http_tokens = "required"
  }

  tags       = local.tags
  depends_on = [aws_key_pair.deployer, module.vpc]
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

  tags = merge({ Name : "Stagnum-postgers" }, local.tags)
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
  name = var.domain
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.${var.domain}"
  type    = "A"
  ttl     = 300
  records = [module.ec2_instance.public_ip]
}

resource "aws_route53_record" "back" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "back.${var.domain}"
  type    = "A"
  ttl     = 300
  records = [module.ec2_instance.public_ip]
}

resource "aws_route53_record" "main" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain
  type    = "A"
  ttl     = 300
  records = [module.ec2_instance.public_ip]
}

########################################################
# IAM role for EC2
########################################################

data "aws_iam_policy_document" "route53_policy" {
  statement {
    sid = "UpdateRoutes"
    actions = [
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets"
    ]
    resources = [aws_route53_zone.primary.arn]
  }
  statement {
    sid = "GetChange"
    actions = [
      "route53:GetChange"
    ]
    resources = ["arn:aws:route53:::change/*"]
  }
  statement {
    sid       = "ListHostedZones"
    actions   = ["route53:ListHostedZonesByName"]
    resources = ["*"]
  }
}

module "iam_policy_from_data_source" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-policy"
  version = "~> 5.0"

  name        = "route53_ec2_modify"
  path        = "/"
  description = "Edit stagnum zones for let's encrypt"

  policy = data.aws_iam_policy_document.route53_policy.json

  tags = {
    PolicyDescription = "Policy created using example from data source"
  }
}

module "iam_assumable_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role"
  version = "~> 5.0"

  trusted_role_services = [
    "ec2.amazonaws.com"
  ]

  create_role = true

  role_name               = "route53_ec2_modify"
  role_requires_mfa       = false
  create_instance_profile = true

  custom_role_policy_arns = [
    module.iam_policy_from_data_source.arn
  ]
  number_of_custom_role_policy_arns = 1
}
