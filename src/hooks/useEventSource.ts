import { useEffect, useRef, useState } from "react";
import { Status } from "~/typing";

interface EventSourceMessage {
  progress?: number;
  filePath?: string;
  status: Status;
}

const useEventSource = (downloadUrl: string, itag?: number) => {
  const eventSource = useRef<EventSource | null>(null);
  const [status, setStatus] = useState<Status>(Status.ready);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!downloadUrl) {
      return;
    }

    const getProgress = () => {
      try {
        setIsLoading(true);
        setProgress(0);
        setStatus(Status.ready);

        const params = new URLSearchParams();
        params.append("url", downloadUrl);
        itag && params.append("format", `${itag}`);

        eventSource.current = new EventSource(
          `/api/download?${params.toString()}`
        );

        eventSource.current.onerror = (event: Event) => {
          console.error("EventSource error:", event);
          setIsLoading(false);
          setStatus(Status.error);
          eventSource.current?.close();
        };

        eventSource.current.onmessage = (event: MessageEvent<string>) => {
          let data: EventSourceMessage;
          try {
            data = JSON.parse(event.data) as EventSourceMessage;
          } catch (e) {
            console.error("Error parsing event data:", e);
            return;
          }

          data.progress && setProgress(data.progress);
          data.status && setStatus(data.status);

          if (data.status === "completed") {
            setIsLoading(false);
            eventSource.current?.close();
          }
        };
      } catch (e) {
        console.error("Error in useEventSource:", e);
        setIsLoading(false);
        setStatus(Status.error);
        setProgress(0);
      }
    };

    void getProgress();
  }, [downloadUrl, itag]);

  return { progress, isLoading, status };
};

export default useEventSource;
