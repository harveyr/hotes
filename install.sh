#!/bin/bash
set -e

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

npm run compile

set -x
rsync -zha --delete \
  --exclude '.git' \
  --exclude '.vscode-test' \
  --exclude '.vscode' \
  $SCRIPTPATH $HOME/.vscode/extensions/
