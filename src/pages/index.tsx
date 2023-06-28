import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { type ChangeEventHandler, useEffect, useMemo, useState } from "react";
import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "~/components/FormatsButtonGroup";
import ProgressBar from "~/components/ProgressBar";
import UrlInput from "~/components/UrlInput";
import useEventSource from "~/hooks/useEventSource";
import { getFilePaths, getInfo } from "~/services/api-service";
import { Status, type Format } from "~/typing";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [grabbedUrl, setGrabbedUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  const { progress, status, isLoading } = useEventSource(
    downloadUrl,
    selectedFormat?.itag
  );

  const { data: files, refetch: refetchFiles } = useQuery(
    ["filePaths"],
    getFilePaths
  );

  const { data: urlInfo, isFetching: isGrabbing } = useQuery(
    ["urlInfo", grabbedUrl],
    () => getInfo(grabbedUrl),
    {
      enabled: !!grabbedUrl,
    }
  );

  const options = useMemo(() => {
    const { videoOnlyFormats, videoWithAudio, audioOnlyFormats } = urlInfo || {
      videoOnlyFormats: [],
      videoWithAudio: [],
      audioOnlyFormats: [],
    };
    return [...videoOnlyFormats, ...videoWithAudio, ...audioOnlyFormats] ?? [];
  }, [urlInfo]);

  const handleGrabClick = () => setGrabbedUrl(url);
  const handleUrlChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setUrl(e.target.value);
  const handleFormatChange: FormatsButtonGroupProps["onChange"] = (option) =>
    setSelectedFormat(option);

  useEffect(() => {
    if (Status.completed === status) {
      setDownloadUrl("");
      void refetchFiles();
    }
  }, [progress, refetchFiles, status]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex max-w-max flex-col justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Grab Your <span className="text-[hsl(280,100%,70%)]">Youtube</span>
          </h1>
          <ProgressBar percentage={progress} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex max-w-max flex-col justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Grab Your <span className="text-[hsl(280,100%,70%)]">Youtube</span>
        </h1>

        {!isLoading && (
          <UrlInput
            value={url}
            isLoading={isGrabbing}
            onGrabButtonClick={handleGrabClick}
            onInputChange={handleUrlChange}
          />
        )}

        {!!options?.length && (
          <div>
            <FormatsButtonGroup
              options={options}
              value={selectedFormat}
              onChange={handleFormatChange}
            />
            {selectedFormat && (
              <button
                className="btn-accent btn w-full"
                onClick={() => setDownloadUrl(url)}
              >
                Download
              </button>
            )}
          </div>
        )}

        {!!files?.length && (
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
        )}
      </div>
    </main>
  );
};

export default Home;
