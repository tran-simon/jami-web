/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */

// Requirements:
// - gerrit-trigger plugin
// - Docker plugin
// - ansicolor plugin

pipeline {
    agent any

    triggers {
        gerrit customUrl: '',
            gerritProjects: [
                [branches: [[compareType: 'PLAIN', pattern: 'master']],
                 compareType: 'PLAIN',
                 disableStrictForbiddenFileVerification: false,
                 pattern: 'jami-web']],
            triggerOnEvents: [
                commentAddedContains('!build'),
                patchsetCreated(excludeDrafts: true, excludeNoCodeChange: true,
                    excludeTrivialRebase: true)]
    }

    options {
        ansiColor('xterm')
    }

    parameters {
            string(name: 'GERRIT_REFSPEC',
                   defaultValue: 'refs/heads/master',
                   description: 'The Gerrit refspec to fetch.')
    }

    stages {
        stage('Initialize submodules') {
            steps {
                sh "git submodule update --init --recursive"
            }
        }
        stage('Build jami-daemon') {
            steps {
                dir("daemon") {
                    sh "docker build --build-arg config_args=\"--with-nodejs\" -t jami-daemon ."
                }
            }
        }
        stage('Lint & Test') {
            steps {
                script {
                    docker.build("jami-web:${env.BUILD_ID}", "--target test .")
                }
            }
        }
        stage('Build') {
            steps {
                script {
                    docker.build("jami-web:${env.BUILD_ID}", "--target build .")
                }
            }
        }
    }
}
