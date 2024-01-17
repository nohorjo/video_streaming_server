#!/bin/bash


FN="$1"

shift
for time in "$@"
do
  if ! [[ -z "$2" ]]
  then
    to="-t $2"
  else
    to=""
  fi
  ffmpeg -i "$FN" -ss $1 $to -c copy $1-$FN
  shift
done