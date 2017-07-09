# Copyright: Thoughtspot 2013
# This script will configure an existing demo vm (as configured by make-dev-vm)

# usage: ./blink/configure-demo-vm.sh vmip password backend branch commit
# vmip is the ip address of the vm.
# password is the desired password for your user account on the vm.
# backend is an existing cluster to use as the backend.
# branch is the git branch to get the changelist from
# commit is the git commit ID to patch

vmip=$1
password=$2
backend=$3
branch=${4:-"origin"}
commit=${5:-""}

#sshpass -p $password ssh -t "$USER@$vmip" \
#    "cd thoughtspot && \
#     git fetch $branch $commit"

sshpass -p $password ssh "$USER@$vmip" "pkill node"

sshpass -p $password ssh "$USER@$vmip" \
    "cd thoughtspot/blink; rm grunt.out"

sshpass -p $password ssh "$USER@$vmip" \
    "cd thoughtspot/blink; \
     nohup grunt package web --backendHost=$backend --hostname=* &> grunt.out &"

num_lines=0
rm /tmp/grunt_tail

while [[ ! `cat /tmp/grunt_tail` =~ .*Running\ \"watch\"\ task.* ]]; do
  sshpass -p $password ssh "$USER@$vmip" \
      "cd thoughtspot/blink; tail -n +$num_lines grunt.out" > /tmp/grunt_tail

  tail_lines=`cat /tmp/grunt_tail | wc -l | cut -d ' ' -f1 | tr -d ' '`
  num_lines=`expr $num_lines + $tail_lines`
  cat /tmp/grunt_tail
  sleep 1
done

echo


