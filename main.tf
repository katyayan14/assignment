provider "aws" {
  region = "us-east-1" # Change this to your preferred region
}

# 1. The VPC
resource "aws_vpc" "simple_vpc" {
  cidr_block = "10.0.0.0/16"
}

# 2. The Subnet (Public)
resource "aws_subnet" "simple_subnet" {
  vpc_id                  = aws_vpc.simple_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}

# 3. Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.simple_vpc.id
}

# 4. Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.simple_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

# 5. Route Table Association
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.simple_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 6. Vulnerable Security Group
resource "aws_security_group" "vulnerable_sg" {
  vpc_id = aws_vpc.simple_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 7. Vulnerable EC2 Instance
resource "aws_instance" "vm_instance" {
  ami                    = "ami-0ecb62995f68bb549" # Verify this AMI is available in your region
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.simple_subnet.id
  vpc_security_group_ids = [aws_security_group.vulnerable_sg.id]
  key_name               = "assignment" # Ensure this matches the name of the .pem in AWS

  root_block_device {
    encrypted = false
  }

  tags = {
    Name = "Vulnerable-Instance"
  }
}

output "public_ip" {
  value = aws_instance.vm_instance.public_ip
}
