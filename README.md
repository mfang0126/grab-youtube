# Grab your Youtube

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

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
