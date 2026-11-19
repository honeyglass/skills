#!/bin/sh
# Fixture for an eval: a deploy tool with typical gaps. It only prints and deploys nothing.
env="${1:-staging}"
case "$env" in prod*) env=production ;; esac
version="$2"
for file in app.js app.css index.html; do
  echo "copy $file to $env"
  if [ "$file" = "index.html" ] && [ -z "$version" ]; then
    echo "something went wrong"
    exit 1
  fi
done
echo "done"
