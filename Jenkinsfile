#!groovy​

properties([
        buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10')),
        pipelineTriggers([]),
        disableConcurrentBuilds()
])

def PRODUCT = "smaug"
def CONTAINER_NAME = "${PRODUCT}-${BRANCH_NAME.toLowerCase()}"
def BUILD_NAME = "$PRODUCT :: $BRANCH_NAME"
def DOCKER_REPO = "docker-fbiscrum.artifacts.dbccloud.dk"
def DOCKER_NAME = "${DOCKER_REPO}/${CONTAINER_NAME}:${BUILD_NUMBER}"
def DOCKER_COMPOSE_NAME = "compose-${DOCKER_NAME}"
def DOCKER_STATUS = ''
def GITLAB_ID = "380"
pipeline {
    agent {
        label 'devel10-head'
    }
    environment {
		GITLAB_PRIVATE_TOKEN = credentials("metascrum-gitlab-api-token")
	}
    stages {
        stage('Test and build image') {
            steps {
                script {
                    sh "docker build -t $DOCKER_NAME --pull --no-cache ."
                }
            }
        }
        stage('Integration test') {
            steps {
                script {
                    ansiColor("xterm") {
                        sh "echo Integrating..."
                        sh "docker-compose -f docker-compose-cypress.yml -p ${DOCKER_COMPOSE_NAME} build"
                        sh "IMAGE=${DOCKER_NAME} docker-compose -f docker-compose-cypress.yml -p ${DOCKER_COMPOSE_NAME} run e2e"
                    }
                }
            }
        }
        stage('Push to Artifactory') {
            when {
                branch "master"
            }
            steps {
                script {
                    if (currentBuild.resultIsBetterOrEqualTo('SUCCESS')) {
                        docker.image("${DOCKER_NAME}").push("${BUILD_NUMBER}")
                    }
                }
            }
        }
        stage("Update staging version number") {
			agent {
				docker {
					label 'devel9-head'
					image "docker-io.dbc.dk/python3-build-image"
					alwaysPull true
				}
			}
			when {
				branch "master"
			}
			steps {
				dir("deploy") {
					git(url: "gitlab@gitlab.dbc.dk:frontend/smaug-deploy.git", credentialsId: "gitlab-isworker", branch: "staging")
					sh """#!/usr/bin/env bash
						set -xe
						rm -rf auto-committer-env
						python3 -m venv auto-committer-env
						source auto-committer-env/bin/activate
						pip install -U pip
						pip install git+https://github.com/DBCDK/kube-deployment-auto-committer#egg=deployversioner
						set-new-version configuration.yaml ${env.GITLAB_PRIVATE_TOKEN} ${GITLAB_ID} ${BUILD_NUMBER} -b staging
					"""
				}
			}
		}
    }
    post {
        always {
            script {
                sh """
                    echo Clean up
                    mkdir -p logs
                    docker-compose -f docker-compose-cypress.yml -p ${DOCKER_COMPOSE_NAME} logs web > logs/web-log.txt
                    docker-compose -f docker-compose-cypress.yml -p ${DOCKER_COMPOSE_NAME} down -v
                    docker image rm $DOCKER_NAME
                """
                archiveArtifacts 'e2e/cypress/screenshots/*, e2e/cypress/videos/*, logs/*'
                junit 'e2e/reports/*.xml'
            }
        }
    }
}
