#! /usr/bin/env bash

pushd "$(dirname "$0")" > /dev/null

source .env

ssh -f -N -R 3333:localhost:3000 $TARGET_HOST -p $TARGET_PORT

popd > /dev/null
