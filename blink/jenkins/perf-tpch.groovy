#!groovy

// Build preparation

node('jenkins-k8s') {
    lock(label: 'blink-kube-small', quantity: 1) {
        ws ('/home/hudson/.inmem_workspace') {
            checkoutScaligent()
            def common = load 'testing/jenkins/common.groovy'
            common.tsBuild() {
                timeout(50) {
                    pipeline(common)
                }
            }
        }
    }
}

// Actual build pipeline

def pipeline(common) {
    def clusterName = "blink-perf-tpch-${BUILD_ID}"
    def clusterSize = 3
    def clusterIps;

    // Pre run setup (provisioning)
    try {
        def hosts;
        stage('Prepare build') {
            timeout(20) {
                parallel 'provision-backends' : {
                    retry(3) {
                        try {
                            clusterIps = common.createK8SBackends(clusterName, clusterSize)
                            hosts = common.ipListToHosts(clusterIps, 8088, ',')
                            common.waitForCallosum(clusterIps)
                        } catch (error) {
                            common.cleanupK8SBackends(clusterName)
                            sleep 60
                            throw error
                        }
                    }
                }, 'prepare-node-modules' : {
                    dir ('blink') {
                        sh 'npm i'
                        sh 'grunt package'
                    }
                }, 'launch-xvfb' : {
                    sh 'Xvfb :20 -screen 1 1920x1080x24 -ac +extension GLX +extension RANDR +render -noreset &'
                }
            }
        }
        

        stage('Push blink') {
            timeout(2) {
                def pushBlinkTasks = [:]
                for (def i = 0; i < clusterSize; i++) {
                    def ip = clusterIps[i]
                    pushBlinkTasks["push-blink-to-${ip}"] = {
                        dir('blink') {
                            common.pushBlink(ip)
                        }
                    }
                }
                parallel pushBlinkTasks
            }
        }

        stage('Validate backends') {
            timeout(5) {
                common.waitForCallosum(clusterIps)
            }
        }

        // Actual test run
        stage('Run blink tests') {
            timeout(25) {
                dir('blink') {
                    // Uncomment the line below to enable test video recording
                    // sh "grunt e2eProtractorFlake --captureFailures=true --hosts=${hosts}"
                    sh "grunt perfTPCH --generateTrace=false --onlyOnce=true --hosts=${hosts} --test-mode=FULL"
                }
            }
        }
    } finally {
        // Post build steps
        try {
            stage('Collect debug info') {
                dir('blink') {
                    common.collectAlerts(clusterIps, 'test/results')
                    archiveArtifacts 'test/results/'
                }
            }

            stage('Report results') {
                junit healthScaleFactor: 0.0, testResults: 'blink/test/results/protractor-perf-tpch*.xml'
            }

            if (!!params.GERRIT_REFSPEC) {
                stage('Update gerrit') {
                    setGerritReview()
                }
            }
        } finally {
            stage('Cleanup resources') {
              stage('Remove Clusters') {
                  common.cleanupK8SBackends(clusterName)
              }
            }
        }
    }
}

