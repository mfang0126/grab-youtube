# Grab your Youtube

It's a learning repo... If you found a copyright issue, and I can remove it.

##

How to run it with docker.

```
docker run -d \
  --env MONGODB_DATABASE=dbname \
  --env MONGODB_URI="mongodb+srv://username:password@cluster0.kjcq3.mongodb.net/?retryWrites=true&w=majority" \
  --env PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
  --env NODE_VERSION=16.20.1 \
  --env YARN_VERSION=1.22.19 \
  --env NODE_ENV=production \
  -p 3000:3000 \
  --name grab-youtube \
  --platform linux/amd64 \
  mfang0126/grab-youtube
```

## Existing bugs

<!-- - add download log, add by batch-->
<!-- - change frontend progress updater to 5s. -->
<!-- - refresh file list once the download finished. -->
<!-- - when the first job starts, the progresive job isn't showing. (maybe it's because the memo isn't update.) -->

- UI is not intuitive...

## show progress button

- has progressing job
  - show progress
- no progressing job
  - request all job check if has progressing job
    - has progressing job
      - show progress
    - no progressing job
      - has ready job
        - start the job and show progress
      - toast `no jobs`
