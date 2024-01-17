#/bin/bash

set -oe pipefail

ffmpeg -i "$1" -acodec mp3 -vcodec copy tmp.mp4
echo rm "$1"
mv tmp.mp4 "$1"
