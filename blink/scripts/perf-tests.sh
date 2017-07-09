#! /bin/bash

timestamp() {
    date +"%s"
}

BACKEND_HOST=localhost
BACKEND_HTTPS='false'
JENKINS_ID=$(timestamp)
COUNTER=0
TIMES=1
NUM_RUNS=1
GIT_ROOT=$(git rev-parse --show-toplevel)
EXPORT_DATA='false'

if [ $# -ge 1 ]; then
    BACKEND_HOST=$1; shift
fi
if [ $# -ge 1 ]; then
    BACKEND_HTTPS=$1; shift
fi
if [ $# -ge 1 ]; then
    NUM_RUNS=$1; shift
fi
if [ $# -ge 1 ]; then
    TIMES=$1; shift
fi

pushd $GIT_ROOT/blink

rm -rf benchmark

while [  $COUNTER -lt $TIMES ]; do
    echo 'Running perfTests. Iteration #'$COUNTER
    killall chrome -s 9 || true
    killall grunt -s 9 || true
    grunt perfTPCH --backendHost=$BACKEND_HOST \
                   --backendHttos=$BACKEND_HTTPS \
                   --jenkinsId=$JENKINS_ID \
                   --numRuns=$NUM_RUNS \
                   --generateTrace=true \
                   --tag=LOCAL
    let JENKINS_ID=JENKINS_ID+1
    let COUNTER=COUNTER+1
done
popd
