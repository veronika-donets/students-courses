pipeline {
    environment {
        PROJECT = 'sombra-courses-api'
    }
    agent {
        docker {
            image 'docker/compose'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    stages {
        stage('Cloning Git') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/veronika-donets/students-courses.git']]])
            }
        }
        stage('Build') {
            environment {
                NODE_ENV = 'test'
                TAG = 'test'
            }
            steps {
                sh 'docker-compose -f docker-compose-production.yml build'
                sh 'docker rmi "${PROJECT}:${TAG}"'
            }
        }
        stage('Test') {
            environment {
                NODE_ENV = 'test'
                TAG = 'test'
                HOME = '.'
            }
            steps {
                withDockerContainer("${PROJECT}:${TAG}") {
                    sh 'npm install jest'
                    sh 'npm run test'
                }
                sh 'docker rmi "${PROJECT}:${TAG}"'
            }
        }
        stage('Deploy') {
            environment {
                NODE_ENV = 'production'
                TAG = 'latest'
            }
            steps {
                sh 'env | sort'
                sh 'docker-compose -f docker-compose-production.yml build'
                withDockerContainer("${PROJECT}:${TAG}") {
                    sh 'npm run db:migrate'
                }
                sh 'docker run "${PROJECT}:${TAG}"'
            }
        }
        stage('Cleaning up') {
            steps {
                sh "docker rmi ${docker images | grep '^<none>'}"
            }
        }
    }
}