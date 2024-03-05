#!/bin/bash

set -eo pipefail

FN=$(basename -- "$1")
extension="${FN##*.}"
filename="${FN%.*}"

ffmpeg -i "$FN" -i "$filename.mp3" -c:v copy -c:a libopus "tmp.$extension"
mv "tmp.$extension" "$FN"
rm "$filename.mp3"
