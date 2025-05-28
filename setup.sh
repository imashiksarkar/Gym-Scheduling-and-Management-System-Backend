#!/bin/bash

function load_env() {
  local file="${1:-.env.local}"
  set -a
  source "$file"
  set +a
}

function get_env() {
  local env

  while [[ "$env" != "test" && "$env" != "dev" ]]; do
    read -rp "? What environment do you want to setup (TEST/dev): " env
    # lower case
    env="${env,,}"

    trimmed="$(echo -e "$env" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

    if [[ -z "$trimmed" ]]; then
      echo "test"
      break
    fi

  done

  echo "$env"

  return 0
}

function is_docker_running() {
  if docker info >/dev/null 2>&1; then
    echo "y"
    return 0
  else
    echo "n"
    return 0
  fi
}

function is_compose_running() {
  local COMPOSE_STATUS=""

  if output=$(docker compose ps -q 2>/dev/null); then
    echo "y"
    return 0
  else
    echo "n"
    return 0
  fi

}

function start_studio() {
  echo "▶ Run Studio"

  pnpm run db:studio &>/dev/null &

  sleep 1

  # Get actual `node` process running prisma Studio
  prisma_studio_pid=$(pgrep -f "node.*prisma.*studio")

  echo -ne "🚀 Access the studio via: \033[0;32mhttp://localhost:5555\033[0m"
}

function up() {

  echo -e "\n⛔ Cleaning up services..."
  docker compose down
  echo "✅ Cleanup complete."

  echo "▶ Running docker compose up for: $@"
  docker compose up "$@" -d
  echo "✅ Services started."

  echo "▶ Running migrations..."
  pnpm run db:push
  echo -e "\n✅ Migrations complete."

  echo "✅ Setup complete."

  start_studio
}

function down() {
  echo -e "\n⛔ Shutting down services..."

  # kill prisma studio
  if [[ -n "$prisma_studio_pid" ]] && kill -0 "$prisma_studio_pid" 2>/dev/null; then
    kill "$prisma_studio_pid"
  fi

  if [[ "$(is_compose_running)" == "y" ]]; then
    echo "▶ Stopping services..."
    docker compose down
    echo "✅ Services stopped."
  fi

  echo

  exit 0
}

arg="$1"
arg="${arg,,}"

main() {
  load_env .env

  local env

  if [[ "$arg" == "--dev" ]]; then
    env="dev"
  elif [[ "$arg" == "--test" ]]; then
    env="test"
  elif [[ "$arg" == "--down" ]]; then
    pkill -f gym-setup
    echo "Setup will go down shortly..."
    exit 0
  else
    env="$(get_env)"
  fi

  if [[ "$env" == "test" ]]; then
    up postgres-test
  elif [[ "$env" == "dev" ]]; then
    up postgres-dev
  fi

  trap down EXIT SIGINT SIGTERM

  exec -a gym-setup tail -f /dev/null &
  local tail_pid=$!
  wait "$tail_pid"
}

main
