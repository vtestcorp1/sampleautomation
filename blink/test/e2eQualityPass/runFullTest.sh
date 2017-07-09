#!/bin/bash
#This file is used to run e2e qa scenario files
#Command ./runFullTest will run all tests under scenarios folder, or
#  with an optional argument ./runFullTest [--job n] will run a specific set
#Right now each set consists of 20 scenario files
files=($(ls scenarios/**/*.js | grep -v .*ignore.*)+$(ls scenarios/*.js))
summary="Summarizing time each test suite takes:\n"
status=0
if [ "$1" == "--job" ]; then
  case "$2" in
    1)
      echo -e "Running e2eQA Job 1...\n"
      files=(${files[@]:0:20})
      ;;
    2)
      echo -e "Running e2eQA Job 2...\n"
      files=(${files[@]:20})
      ;;
    *)
      echo -e "Wrong job ID\n"
      ;;
  esac
fi
for scenario in ${files[@]}
do
  filename=${scenario##*/}
  testname=${filename%-scenarios.js}
  echo "--running: grunt e2eQualityPass --qatestname=${testname} --test-mode=FULL"
  { runtime=$( TIMEFORMAT='%lR';{ time grunt e2eQualityPass --qatestname=${testname} --test-mode=FULL 1>&3- 2>&4-; } 2>&1 ); } 3>&1 4>&2
  if [[ $? != 0 ]]; then status=1; fi
  summary+="${filename} took time ${runtime}\n"
  echo "exiting chrome"
  pkill chrome
done

echo -e $summary
exit $status
