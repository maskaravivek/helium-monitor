#!/bin/bash

cd ..
mkdir dist
cp -R menu-bar-app/ dist
cd dist
rm -rf node_modules build dist myAApp.js preload.js README.md yarn.lock package.json package-lock.json .gitignore
cd ..