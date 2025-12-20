provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "simple_vpc" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "simple_subnet" {
  vpc_id                  = aws_vpc.simple_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = false
}

resource "aws_security_group" "vulnerable_sg" {
  vpc_id      = aws_vpc.simple_vpc.id
  description = "Hardened SG for Chatbot"

  ingress {
    description = "Allow SSH from internal"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    description = "Allow HTTPS outbound for updates"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }
}

resource "aws_instance" "vm_instance" {
  ami           = "ami-0e2c8ccd9e036d13a" 
  instance_type = "t2.micro"
  
  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    encrypted = true
  }
}
