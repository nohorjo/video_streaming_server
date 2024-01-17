#!/bin/bash

set -oe pipefail

input="$1"
ffmpeg -ss "$(bc -l <<< "$(ffprobe -loglevel error -of csv=p=0 -show_entries format=duration "$input")*0.5")" -i "$input" -vf 'scale=320:320:force_original_aspect_ratio=decrease' -frames:v 1 "$1".png
