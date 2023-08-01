# Grab your Youtube

It's a learning repo... If you found a copyright issue, and I can remove it.

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
