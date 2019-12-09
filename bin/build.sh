#!/usr/bin/env bash

rm -rf ./prod
mkdir ./prod
mkdir ./prod/build

mv -v build/* prod/build/
cp app.js config.js folderList.json logger.js helpers.js package.json package-lock.json prod

zip -r "torrentBox-$(date +"%Y-%m-%d|%H-%M-%S").zip" prod/*
