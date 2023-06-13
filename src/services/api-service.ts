import { useEffect, useRef, useState } from "react";

interface EventSourceMessage {
  progress?: number;
  filePath?: string;
  status: "downloading" | "completed";
}

const useEventSource = (downloadUrl: string) => {
  const eventSource = useRef<EventSource | null>(null);
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

          if (data.progress) {
            setProgress(data.progress);
          }

          if (data.status === "completed") {
            setFielPath(data.filePath);
            setIsLoading(false);
            eventSource.current?.close();
          }
        };
      } catch (e) {
        // Log any errors
        console.error("Error in useEventSource:", e);
        setIsLoading(false);
      }
    };

    void getProgress();
  }, [downloadUrl]);

  return { progress, filePath, isLoading };
};

export default useEventSource;
