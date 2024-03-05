#!/bin/bash


FN="$1"

shift
for time in "$@"
do
  if ! [[ -z "$2" ]]
  then
    to="-t $(bc -l <<< "$2 - $1")"
  else
    to=""
  fi
  ffmpeg -n -ss $1 $to -i "$FN" -c copy $1-$FN
  shift
done