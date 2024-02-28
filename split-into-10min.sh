#!/bin/bash


FN="$1"

sox "$FN" "split-$FN" trim 0 599 : newfile : restart