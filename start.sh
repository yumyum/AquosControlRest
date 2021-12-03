#! /bin/bash

dirname "${0}"
pushd $(dirname "${0}") > /dev/null

rm /home/pi/.forever/*.log

forever start -c "npm start" ./

popd > /dev/null
