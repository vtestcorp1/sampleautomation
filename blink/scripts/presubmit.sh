#!/bin/sh
BACKEND_HOST=$DEV_CLUSTER_HOST
if [ $# -gt 0 ]
then
    BACKEND_HOST=$1
fi
grunt jshint --gitlintfiles=app/src/**/*.js unit e2e-prod --test-mode=SMOKE --backendHost=$BACKEND_HOST
