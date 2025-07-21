#! /usr/bin/env bash

pushd "$(dirname "$0")" > /dev/null

echo "[$(date -Is)] onBoot start sleep 60 sec"

sleep 60

echo "[$(date -Is) start port_forwarding]"
./ssh_port_forward.sh

popd > /dev/null
