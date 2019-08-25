#!/usr/bin/env bash

# Tags and deploys images with the code version once they're deemed stable
# this is intended to run when merged to the master branch
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
