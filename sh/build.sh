#!/bin/bash

ARGS=("$@")
ENV="${ARGS[0]}"
BUILD_NUMBER_NEW="${ARGS[1]}"
API_URL="${ARGS[2]}"
API_HOSTNAME="${ARGS[3]}"

# Development Build
# Via: https://developer.chrome.com/docs/webstore/cws-dashboard-distribution/#publishing-a-test-version
echo "Generator Development: Firefox Manifest v2 zip file"
./sh/release.sh $ENV $BUILD_NUMBER_NEW 2.dev $API_URL $API_HOSTNAME

echo "Generator Development: Chrome Manifest v3 zip file"
./sh/release.sh $ENV $BUILD_NUMBER_NEW 3.dev $API_URL $API_HOSTNAME

# Production Build
echo "Generator: Firefox Manifest v2 zip file"
./sh/release.sh $ENV $BUILD_NUMBER_NEW 2 $API_URL $API_HOSTNAME

echo "Generator: Chrome Manifest v3 zip file"
./sh/release.sh $ENV $BUILD_NUMBER_NEW 3 $API_URL $API_HOSTNAME