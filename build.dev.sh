#!/bin/bash
ARGS=("$@")
BUILD_NUMBER_NEW="${ARGS[0]}"

./sh/build.sh "dev" $BUILD_NUMBER_NEW "https://localhost:3002" "https://localhost"