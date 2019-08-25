#!/usr/bin/env bash

# Building the image
sudo docker build -t $REPOSITORY_URI:latest -f Dockerfile .

# Tagging and pushing the image with the shortened commit hash and as latest
SHORT_COMMIT_HASH=$(echo $TRAVIS_COMMIT | cut -c1-7)
sudo docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$SHORT_COMMIT_HASH
