output "ec2_eip" {
  value = module.ec2_instance.public_ip
}

output "ec2_public_dns" {
  value = module.ec2_instance.public_dns
}
