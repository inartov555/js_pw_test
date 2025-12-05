#!/bin/bash

# Input parameters:
#   - $1 - true - starting service WITHOUT cached data (allows to start the service faster);
#          false - starting the service WITH cache (cache is cleared)
#          default = false

clear_cache=${1:-false}

set -Eeuo pipefail
trap cleanup EXIT ERR SIGINT SIGTERM

cleanup() {
  docker compose down -v --remove-orphans
  if ! [[ "$ORIGINAL_PROJECT_PATH" -ef "$(pwd)" ]]; then
    echo "Returning to the original project path to be able to run the test again with new changes, if there are any"
    cd "$ORIGINAL_PROJECT_PATH"
  fi
}

ORIGINAL_PROJECT_PATH="$(pwd)"
source ./setup.sh || { echo "setup.sh failed"; exit 1; }
if [[ $? -ne 0 ]]; then
  exit 1
fi

echo "Building images..."
case "$clear_cache" in
  true)
    echo "Cache will be cleared when starting the service"
    docker compose build js_pw_test --no-cache
    ;;
  *)
    echo "Cache will be preserved when starting the service"
    docker compose build js_pw_test
esac

echo "Starting the tests..."
# Allow containers to use your X server (one-time / per session)
# xhost +local:docker
# docker run --rm -it \
#  -e DISPLAY=1 \
#  -v /tmp/.X11-unix:/tmp/.X11-unix \
#  framework-js_pw_test

docker compose run --rm js_pw_test

# Running tests WITHOUT Docker
# npm install
# npx playwright install
# npx playwright test --trace on --headed --reporter=list,html

# npx playwright test -g "TC1: successful one-way search" --trace on --headed --reporter=list,html

#
#
#
