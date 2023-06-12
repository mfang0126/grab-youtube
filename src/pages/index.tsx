import axios from "axios";
import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import ProgressBar from "~/components/ProgressBar";

const Home: NextPage = () => {
  const [url, setUrl] = useState("https://youtu.be/aY1R0lH38bY");
  const [progress, setProgress] = useState(0);
  const eventSource = useRef<EventSource | null>(null);
  const [downloadPath, setDownloadPath] = useState("");

  const downloadVideo = async () => {
    try {
      const { data } = await axios.get("/api/download", {
        params: {
          url,
        },
      });

      const { client_id } = data;

      eventSource.current = new EventSource(
        `/api/events?client_id=${client_id}`
      );

      eventSource.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress) {
          setProgress(data.progress);
        }

        if (data.status === "completed") {
          setDownloadPath(`/downloads/${client_id}.mp4`);
          eventSource.current?.close();
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    return () => {
      eventSource.current?.close();
    };
  }, []);

  const onSearch = () => {
    downloadVideo();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex max-w-max flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Grab Your <span className="text-[hsl(280,100%,70%)]">Youtube</span>{" "}
        </h1>
        {progress !== 0 && progress !== 100 && (
          <ProgressBar percentage={progress} />
        )}
        {downloadPath && (
          <a
            href={downloadPath}
            target="_blank"
            className="rounded bg-blue-500 px-3 py-2 text-sm text-blue-100 no-underline hover:bg-blue-600 hover:text-blue-200 hover:underline"
          >
            {downloadPath}
          </a>
        )}

        <div className="grid w-full grid-cols-1 gap-4">
          <div className="flex items-center border-b-2 border-white py-2">
            <input
              className="mr-3 w-full appearance-none border-none bg-transparent px-2 py-1 leading-tight text-white focus:outline-none"
              type="text"
              value={url}
              placeholder="https://youtu.be/aY1R0lH38bY"
              aria-label="Youtube URL"
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="flex-shrink-0 rounded border-4 border-teal-500 bg-teal-500 px-2 py-1 text-sm text-white hover:border-teal-700 hover:bg-teal-700"
              type="button"
              onClick={onSearch}
            >
              Grab
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
