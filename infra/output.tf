
output "front_lb_dns" {
  value       = aws_alb.front-lb.dns_name
  description = "AWS load balancer DNS Name for frontend"
}

output "back_lb_dns" {
  value       = aws_alb.back-lb.dns_name
  description = "AWS load balancer DNS name for backend"

}