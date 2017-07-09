#!/bin/bash

if [ $# -le 3 ]; then
    echo "call it as ./parallel <num threads> <num_items> <protractor command>"
    exit 1;
fi

threads=$1
shift;
items=$1
shift;
cmd=$@
perThread=$((items/threads))

echo "Running test with:"
echo "${threads} threads and ${perThread} items per thread"
echo

run_cmd() {
    fn=$1
    shift
    $* | tee $fn
}

export -f run_cmd

seq 0 $perThread $items | parallel --ungroup --verbose run_cmd /tmp/file{} $cmd --params.skipExisting true --params.skip={}
