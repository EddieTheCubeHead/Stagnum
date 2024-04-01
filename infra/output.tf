
output "lb_dns" {
  value       = aws_alb.aws-lb.dns_name
  description = "AWS load balancer DNS Name"
}