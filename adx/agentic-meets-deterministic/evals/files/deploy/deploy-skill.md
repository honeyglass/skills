---
name: deploy
description: Deploys the web app.
---

# Deploy

1. Look at the git log and decide which version number comes next.
2. Run `./deploy.sh <env> <version>`.
3. If it fails, read the error, fix what you think is wrong and run it again until it passes.
4. Make sure the version number is higher than the last one.
5. Tell the user it is done.
