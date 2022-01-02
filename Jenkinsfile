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
                sh "echo ${GIT_BRANCH}"
                checkout([$class: 'GitSCM', branches: [[name: GIT_BRANCH]], extensions: [], userRemoteConfigs: [[url: 'https://github.com/veronika-donets/students-courses.git']]])
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
            when { environment name: 'GIT_BRANCH', value: 'origin/jenkins' }
            agent { label 'jenkins-production' }
            environment {
                NODE_ENV = 'production'
                TAG = 'latest'
            }
            steps {
                checkout([$class: 'GitSCM', branches: [[name: GIT_BRANCH]], extensions: [], userRemoteConfigs: [[url: 'https://github.com/veronika-donets/students-courses.git']]])
                sh 'docker-compose -f docker-compose.yml up --build -d'
                sh "docker exec -e NODE_ENV=${NODE_ENV} ${PROJECT} npm run db:migrate"
            }
        }
    }
}