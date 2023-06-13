import { type NextPage } from "next";
import { useEffect, useState } from "react";
import ProgressBar from "~/components/ProgressBar";
import useEventSource from "~/services/api-service";

const Home: NextPage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadPath, setDownloadPath] = useState("");
  const { progress, filePath, isLoading } = useEventSource(downloadPath);

  const handleSearchClick = () => {
    setDownloadPath(youtubeUrl);
  };

  useEffect(() => {
    if (progress === 100) {
      setYoutubeUrl("");
    }
  }, [progress]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex max-w-max flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Grab Your <span className="text-[hsl(280,100%,70%)]">Youtube</span>
        </h1>

        {!isLoading && (
          <div className="grid w-full grid-cols-1 gap-4">
            <div className="flex items-center border-b-2 border-white py-2">
              <input
                className="mr-3 w-full appearance-none border-none bg-transparent px-2 py-1 leading-tight text-white focus:outline-none"
                type="text"
                placeholder="https://youtu.be/aY1R0lH38bY"
                value={youtubeUrl}
                aria-label="Youtube URL"
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <button
                className="flex-shrink-0 rounded border-4 border-teal-500 bg-teal-500 px-2 py-1 text-sm text-white hover:border-teal-700 hover:bg-teal-700"
                type="button"
                onClick={handleSearchClick}
              >
                Grab
              </button>
            </div>
          </div>
        )}

        <ProgressBar percentage={progress} />

        {progress === 100 && (
          <a
            href={filePath}
            target="_blank"
            className="rounded bg-blue-500 px-3 py-2 text-sm text-blue-100 no-underline hover:bg-blue-600 hover:text-blue-200 hover:underline"
          >
            {filePath}
          </a>
        )}
      </div>
    </main>
  );
};

export default Home;
