# Copyright: Thoughtspot 2013
# This script will create and configure a new demo vm, running blink against
# an existing backend cluster.

# usage: ./blink/make-dev-vm.sh vmname password backend branch commit
# vmname is the intended name of the vm.
# password is the desired password for your user account on the vm.
# backend is an existing cluster to use as the backend.
# branch is the git branch to get the changelist from
# commit is the git commit ID to patch

vmname=$1
password=$2
backend=$3
branch=${4:-"origin"}
commit=${5:-""}

source ./git_scripts/make-dev-vm.sh $vmname $password
echo $DEV_VM_IP
./blink/scripts/configure-demo-vm.sh $DEV_VM_IP $password $backend $branch $commit

echo "######################################"
echo "## Demo is running on $DEV_VM_IP ##"
echo "######################################"

