import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import FormatsButtonGroup from "~/components/FormatsButtonGroup";
import ProgressBar from "~/components/ProgressBar";
import UrlInput from "~/components/UrlInput";
import useEventSource from "~/hooks/useEventSource";
import { getFilePaths, getInfo } from "~/services/api-service";

const Home: NextPage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadPath, setDownloadPath] = useState("");

  const { progress, filePath, isLoading } = useEventSource(downloadPath);

  const { data: files } = useQuery(["filePaths", filePath], getFilePaths);
  const { data: info } = useQuery(["info", filePath], () =>
    getInfo(youtubeUrl)
  );

  const options = useMemo(() => {
    const formats = info?.videoOnlyFormats.map(
      (format) => `${format.qualityLabel}-${format.itag}`
    );
    return formats ?? [];
  }, [info?.videoOnlyFormats]);

  useEffect(() => {
    if (progress === 100) {
      setYoutubeUrl("");
      setDownloadPath("");
    }
  }, [progress]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex max-w-max flex-col justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Grab Your <span className="text-[hsl(280,100%,70%)]">Youtube</span>
        </h1>

        {!isLoading && (
          <UrlInput
            value={youtubeUrl}
            onGrabButtonClick={() => setDownloadPath(youtubeUrl)}
            onInputChange={(e) => setYoutubeUrl(e.target.value)}
          />
        )}

        <FormatsButtonGroup options={options} />

        {isLoading && <ProgressBar percentage={progress} />}

        <div>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">
            Click to Download
          </h1>
          <div className="flex flex-col justify-center gap-4">
            {files?.map((file) => (
              <a
                key={file.name}
                href={file.path}
                target="_blank"
                className="btn-primary btn rounded-md"
              >
                {file.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
