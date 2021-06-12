#!/bin/bash

cd /home/runner/work/helium-monitor/helium-monitor
mkdir build
mkdir build/helium-monitor
cp -R menu-bar-app/ build/helium-monitor/
cd build/helium-monitor/
rm -rf node_modules build dist myAApp.js preload.js privacy-policy.html README.md yarn.lock package.json package-lock.json .gitignore
cd ..
zip -r helium-monitor.zip helium-monitor/

# rm -rf helium-monitor