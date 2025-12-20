pipeline {
    agent any
    environment {
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
		sh 'mkdir -p /home/ubuntu/assignment'
                sh 'cp -r . /home/ubuntu/assignment/'
            }
        }

        stage('Infrastructure Security Scan') {
            steps {
                echo '--- TRIVY TERRAFORM SCAN ---'
                sh 'chmod -R 777 .'
                // Use the REAL host path so the host Docker engine can find it
                sh 'docker run --rm -v /home/ubuntu/assignment:/src aquasec/trivy config /src'
            }
        }

        stage('Terraform Plan') {
            steps {
                sh '''
                    docker run --rm -v /home/ubuntu/assignment:/src -w /src \
                    -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
                    -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
                    hashicorp/terraform:latest init

                    docker run --rm -v /home/ubuntu/assignment:/src -w /src \
                    -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
                    -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
                    hashicorp/terraform:latest plan
                '''
            }
        }

        stage('Deploy ChatBot App') {
            steps {
                echo "--- DEPLOYING CHATBOT VIA DOCKER-COMPOSE ---"
                // FIX: Based on your 'ls' output, your app files are in the root
                // If they are in the root, we run compose directly.
                sh 'docker-compose up -d --build'
            }
        }
    }
}
