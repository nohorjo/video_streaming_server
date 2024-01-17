#!/bin/bash

set -oe pipefail

FN=$1

echo $FN

ffmpeg -i "$FN" -s hd480 -c:v libx264 -crf 23 -c:a aac -strict -2 -filter:v fps=fps=3 /tmp/downscale.mp4
mv /tmp/downscale.mp4 "$FN"
