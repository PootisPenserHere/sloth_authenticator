#!/usr/bin/env bash

# Logging into thr docker registry
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Building the image
sudo docker build -t $REPOSITORY_URI:latest -f Dockerfile .

# Tagging and pushing the image with the shortened commit hash and as latest
SHORT_COMMIT_HASH=$(echo $TRAVIS_COMMIT | cut -c1-7)
sudo docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$SHORT_COMMIT_HASH
sudo docker push $REPOSITORY_URI:latest
sudo docker push $REPOSITORY_URI:$SHORT_COMMIT_HASH

# Tagging and pushing the images by build version
OIFS=$IFS # Backups the current field separator
IFS='-' # Change the field separator for the one needed to parse the version
image_version=''
for x in $(cat VERSION)
do
    image_version="$image_version$x"
    sudo docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$image_version
    sudo docker push $REPOSITORY_URI:$image_version
    image_version="$image_version." # Adds a period to separate the sub version on the next iteration
done

IFS=$OIFS # Restore the previous field separator
