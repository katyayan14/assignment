terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

# Create a VPC
resource "aws_vpc" "example" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "simple_subnet" {
  vpc_id                  = aws_vpc.simple_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}


#Security Configuration 
resource "aws_security_group" "vulnerable_sg" {
  vpc_id = aws_vpc.simple_vpc.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "vm_instance" {
  ami           = "ami-0ecb62995f68bb549" 
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.simple_subnet.id

  # Linking the vulnerable security group
  vpc_security_group_ids = [aws_security_group.vulnerable_sg.id]

  # VULNERABILITY: Unencrypted disk volume
  root_block_device {
    encrypted = false
  }

  tags = {
    Name = "Vulnerable-Instance"
  }
}

