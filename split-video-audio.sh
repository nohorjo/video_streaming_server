#!/bin/bash

set -eo pipefail

FN=$(basename -- "$1")
extension="${FN##*.}"
filename="${FN%.*}"

echo $filename
echo $extension

ffmpeg -i "$FN" -vn -b:a 96k "$filename.mp3"
ffmpeg -i "$FN" -vcodec copy -an "tmp.$extension"
mv "tmp.$extension" "$FN"
