#!/bin/bash

# Input parameters:
#
#     Use docker (is_isolated)
#   - $1 - true - Docker launches tests with NPM, isolated environment;
#          false - NPM starts tests, NO isolated environment;
#          default = false;
#
#     Only if Docker is used, clearing cache before starting service (when is_isolated = true)
#   - $2 - true - starting tests WITHOUT cached data (allows to start the service faster);
#          false - starting the tests WITH cache (cache is cleared);
#          default = false;

is_isolated="${1:-false}"
clear_cache="${2:-false}"

set -Eeuo pipefail
trap cleanup EXIT ERR SIGINT SIGTERM

cleanup() {
  case "$is_isolated" in
    true)
      echo "Cleaning docker setup..."
      docker compose down -v --remove-orphans
      ;;
    *)
      # Not isolated environment
  esac
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
    case "$is_isolated" in
      true)
        echo "Cache will be cleared when starting the service"
        docker compose build js_pw_test --no-cache
        ;;
      *)
        # Not isolated environment
    esac
    ;;
  *)
    case "$is_isolated" in
      true)
        echo "Cache will be preserved when starting the service"
        docker compose build js_pw_test
        ;;
      *)
        # Not isolated environment
    esac
esac

echo "Starting the tests..."

case "$is_isolated" in
  true)
    echo " >>> Docker"
    TEST_GREP=""
    # If you need to run particular test(s), then set it as shown in the line below (TEST_GREP);
    # to run all tests, just set TEST_GREP=""
    # TEST_GREP="-g 'TC1: Successful one-way search with valid From, To and date'"
    docker compose run -e TEST_GREP="$TEST_GREP" --rm js_pw_test
    ;;
  *)
    echo " >>> Non docker"
    # Running tests WITHOUT Docker
    npm install
    npx playwright install
    npx playwright test --headed
    
    # npx playwright test -g "TC1: successful one-way search" --trace on --headed --reporter=list,html
esac

#
#
#
