output "ec2_eip" {
  value = module.ec2_instance.public_ip
}

output "ec2_public_dns" {
  value = module.ec2_instance.public_dns
}

output "dns_nameservers" {
  value = aws_route53_zone.primary.name_servers
}