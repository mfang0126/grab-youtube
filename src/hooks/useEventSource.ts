import { useEffect, useRef, useState } from "react";
import { Status } from "~/typing";

interface EventSourceMessage {
  progress?: number;
  filePath?: string;
  status: Status;
}

const useEventSource = (downloadUrl: string) => {
  const eventSource = useRef<EventSource | null>(null);
  const [status, setStatus] = useState<Status>(Status.ready);
  const [progress, setProgress] = useState(0);
  const [filePath, setFielPath] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!downloadUrl) {
      return;
    }

    const getProgress = () => {
      try {
        setIsLoading(true);
        setFielPath("");
        if (!eventSource.current) {
          eventSource.current = new EventSource(
            `/api/download?url=${downloadUrl}`
          );
        }

        // Handle incoming messages
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
            setFielPath(data.filePath);
            setIsLoading(false);
            eventSource.current?.close();
          }
        };

        // eventSource.current.onerror = (event) => {
        //   console.log(event);
        // };
      } catch (e) {
        // Log any errors
        console.error("Error in useEventSource:", e);
        setIsLoading(false);
        setStatus(Status.ready);
      }
    };

    void getProgress();
  }, [downloadUrl]);

  return { progress, filePath, isLoading, status };
};

export default useEventSource;
