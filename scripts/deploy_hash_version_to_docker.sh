#!/usr/bin/env bash

# Deploys the current build tagged with its commit hash
SHORT_COMMIT_HASH=$(echo $TRAVIS_COMMIT | cut -c1-7)
sudo docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$SHORT_COMMIT_HASH
sudo docker push $REPOSITORY_URI:$SHORT_COMMIT_HASH
