"use client";

import { useEffect, useRef, useState } from "react";
import { Status, type JobItem } from "~/typing";
import useToast from "./useToast";

interface Progress {
  progress: number;
  status: Status;
}

// get the current progress of the downloading job
export default function useProgress(live: boolean, runningJob?: JobItem) {
  const eventSource = useRef<EventSource | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(Status.ready);
  const { toast } = useToast();

  useEffect(() => {
    if (!live || !runningJob) {
      return;
    }

    setProgress(runningJob.progress ?? 0);

    if (eventSource.current) {
      eventSource.current?.close();
    }

    runningJob.progress && setProgress(runningJob.progress);
    runningJob.status && setStatus(runningJob.status);

    eventSource.current = new EventSource(
      `/api/jobs/${runningJob._id}/progress`
    );
    eventSource.current.onmessage = (event: MessageEvent<string>) => {
      const { progress, status } = JSON.parse(event.data) as Progress;

      setProgress(progress);
      setStatus(status);

      if (status === Status.completed) {
        eventSource.current?.close();
      }
    };
    eventSource.current.onerror = (event: Event) => {
      console.error("EventSource error:", event);
      toast({ message: "Error on getting downloading progress" });
      eventSource.current?.close();
    };

    return () => eventSource.current?.close();
  }, [runningJob, live, toast]);

  return { progress, status };
}
