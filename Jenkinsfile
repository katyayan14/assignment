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
                // Removed the chmod line that was causing the permission error
            }
        }
        stage('Infrastructure Security Scan') {
            steps {
                echo '--- TRIVY TERRAFORM SCAN ---'
                sh "docker run --rm -v ${WORKSPACE}:/src aquasec/trivy config /src"
            }
        }
        stage('Deploy ChatBot App') {
            steps {
                echo "--- DEPLOYING CHATBOT VIA DOCKER COMPOSE ---"
                sh 'docker compose up -d --build'
            }
        }
    }
}
