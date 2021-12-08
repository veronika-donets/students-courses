pipeline {
    agent { docker { image 'node:16-alpine' } }
    stages {
        stage('Build') {
            steps {
                sh 'npm run docker:build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }
        stage('Deploy') {
            steps {
                echo 'npm run docker:run'
            }
        }
    }
}