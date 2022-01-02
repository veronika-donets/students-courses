pipeline {
    agent none
    environment {
        PROJECT = 'sombra-courses-api'
    }
    stages {
        stage('Build') {
            agent { label 'jenkins-slave-1' }
            environment {
                NODE_ENV = 'test'
                TAG = 'test'
            }
            steps {
                sh 'printenv'
                checkout([$class: 'GitSCM', branches: [[name: "*/jenkins"]], extensions: [], userRemoteConfigs: [[url: 'https://github.com/veronika-donets/students-courses.git']]])
                sh 'docker-compose build'
            }
        }
        stage('Test') {
            agent { label 'jenkins-slave-1' }
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
                sh 'docker volume prune -f'
                sh 'docker image prune -f'
                sh 'docker container prune -f'
            }
        }
        stage('Deploy') {
            when { branch 'jenkins' }
            agent { label 'jenkins-production' }
            environment {
                NODE_ENV = 'production'
                TAG = 'latest'
            }
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/jenkins']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/veronika-donets/students-courses.git']]])
                sh 'docker-compose build'
                sh 'docker-compose start api'
//                 sh 'docker-compose build api'
//                 withDockerContainer("${PROJECT}:${TAG}") {
//                     sh 'npm run db:migrate'
//                 }
//                 sh 'docker-compose up --no-deps -d api'
            }
        }
    }
}