import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface DownloadResponse {
  client_id: string;
}

interface EventSourceMessage {
  progress?: number;
  filePath?: string;
  status: "downloading" | "completed";
}

const useEventSource = (downloadUrl: string) => {
  const eventSource = useRef<EventSource | null>(null);
  const [progress, setProgress] = useState(0);
  const [filePath, setFielPath] = useState<string>();

  useEffect(() => {
    if (!downloadUrl) {
      return;
    }

    const getProgress = async () => {
      try {
        // Fetch client_id from the server
        const { data } = await axios.get<DownloadResponse>("/api/download", {
          params: { url: downloadUrl },
        });

        if (!data.client_id) {
          throw new Error("Invalid response from server.");
        }
        const client_id = data?.client_id;

        if (!eventSource.current) {
          eventSource.current = new EventSource(
            `/api/events?client_id=${client_id}`
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
            eventSource.current?.close();
          }
        };
      } catch (e) {
        // Log any errors
        console.error("Error in useEventSource:", e);
      }
    };

    void getProgress();
  }, [downloadUrl]);

  console.log(eventSource.current, downloadUrl);
  return { progress, filePath };
};

export default useEventSource;
