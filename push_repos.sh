#!/bin/bash

TOKEN="YOUR_GITHUB_TOKEN_HERE"
ORG="fhish-tech"
USER="nickthelegend"

# Define the repositories to push
REPOS=(
  "."
  "fhish-cli"
  "fhish-demo"
  "fhish-gateway"
  "fhish-hardhat-plugin"
  "fhish-sdk"
  "packages/fhish-contracts-v2"
  "packages/fhish-coprocessor"
  "packages/fhish-relayer-v2"
  "packages/fhish-sdk-v2"
  "packages/fhish-wasm"
)

for DIR in "${REPOS[@]}"; do
  if [ ! -d "$DIR/.git" ]; then
    echo "No .git directory found in $DIR. Skipping."
    continue
  fi

  if [ "$DIR" == "." ]; then
    REPONAME="fhish"
  else
    REPONAME=$(basename "$DIR")
  fi

  echo "==========================================="
  echo "Processing $REPONAME in directory $DIR"
  
  # 1. Create repo in fhish-tech org
  echo "Creating repo $REPONAME in org $ORG..."
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/orgs/$ORG/repos \
    -d "{\"name\": \"$REPONAME\", \"private\": false}"

  # 2. Add/Update remote and push to fhish-tech
  cd "$DIR"
  git remote remove origin 2>/dev/null
  git remote add origin "https://$TOKEN@github.com/$ORG/$REPONAME.git"
  echo "Pushing to $ORG/$REPONAME..."
  git push -u origin --all
  git push -u origin --tags
  
  # 3. If it's one of "both repos" (main fhish and fhish-cli), push to nickthelegend too
  if [ "$REPONAME" == "fhish" ] || [ "$REPONAME" == "fhish-cli" ]; then
    echo "Creating repo $REPONAME for user $USER..."
    curl -s -o /dev/null -w "%{http_code}\n" -X POST \
      -H "Authorization: token $TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d "{\"name\": \"$REPONAME\", \"private\": false}"

    git remote remove nickthelegend 2>/dev/null
    git remote add nickthelegend "https://$TOKEN@github.com/$USER/$REPONAME.git"
    echo "Pushing to $USER/$REPONAME..."
    git push -u nickthelegend --all
    git push -u nickthelegend --tags
  fi

  cd - > /dev/null
done

echo "All done!"
