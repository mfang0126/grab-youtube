# Grab your Youtube

It's a learning repo... If you found a copyright issue, and I can remove it.

## Existing bugs

- When it's not job, the new job is not showing in the list. Maybe it's not refreshing?
-

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
