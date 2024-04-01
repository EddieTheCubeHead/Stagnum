output "database_connection_string" {
    value = "postgresql://${var.postgres_user}:${var.postgres_pass}@${"Tähän dns"}:${var.postgres_port}/${var.postgres_db}"
}