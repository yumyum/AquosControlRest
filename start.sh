#! /bin/bash

dirname "${0}"
pushd $(dirname "${0}") > /dev/null

rm /home/pi/.forever/*.log

forever start -c "npm start" ./
# forever start -c "yarn start" ./

popd > /dev/null
