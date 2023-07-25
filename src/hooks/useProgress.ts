"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { getAllQueueJobs } from "~/services/api-service";
import { Status } from "~/typing";

interface Progress {
  progress: number;
  status: Status;
}

// get the current progress of the downloading job
export default function useProgress(live: boolean) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(Status.ready);

  const { data: downloadingJob } = useSWR("/api/jobs/queue", () =>
    getAllQueueJobs(Status.downloading)
  );

  useEffect(() => {
    const job = downloadingJob?.[0];
    console.log(job);
    if (!job || !live) {
      return;
    }

    const eventSource = new EventSource(`/api/jobs/${job._id}/progress`);
    eventSource.onmessage = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as Progress;
      console.log("progress", data);
      setProgress(data.progress);
      setStatus(data.status);
    };
    eventSource.onerror = (event: Event) => {
      console.error("EventSource error:", event);
      eventSource?.close();
    };

    return () => eventSource.close();
  }, [downloadingJob, live]);

  return { progress, status };
}
