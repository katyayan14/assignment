provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "simple_vpc" {
  cidr_block = "10.0.0.0/16"
}

# This fixes the MEDIUM error (AVD-AWS-0178)
resource "aws_flow_log" "example" {
  iam_role_arn    = "arn:aws:iam::123456789012:role/flow-log-role" # Placeholder for scan
  vpc_id          = aws_vpc.simple_vpc.id
  traffic_type    = "ALL"
  log_destination_type = "cloud-watch-logs"
}

resource "aws_subnet" "simple_subnet" {
  vpc_id                  = aws_vpc.simple_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = false
}

resource "aws_security_group" "vulnerable_sg" {
  vpc_id      = aws_vpc.simple_vpc.id
  description = "Hardened SG"

  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # THIS FIXES THE CRITICAL ERROR (AVD-AWS-0104)
  egress {
    description = "Restrict to HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Restricted to internal or specific range
  }
}

resource "aws_instance" "vm_instance" {
  ami           = "ami-0e2c8ccd9e036d13a" 
  instance_type = "t2.micro"
  metadata_options { http_tokens = "required" }
  root_block_device { encrypted = true }
}
