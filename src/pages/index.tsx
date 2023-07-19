import { useQuery } from "@tanstack/react-query";
import { ObjectId } from "mongodb";
import type { NextPage } from "next";
import { useEffect, useState, type ChangeEventHandler } from "react";
import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "~/components/FormatsButtonGroup";
import ProgressBar from "~/components/ProgressBar";
import Toast from "~/components/Toast";
import UrlInput from "~/components/UrlInput";
import useEventSource from "~/hooks/useEventSource";
import {
  getFilePaths,
  getJobInfo,
  sendJobToQueue,
} from "~/services/api-service";
import { Status, type Format } from "~/typing";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [options, setOptions] = useState<Format[]>([]);
  const [videoId, setVideoId] = useState("");
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

  // Maybe useSwr is a good enough though...
  const { isFetching: isGrabbing, refetch } = useQuery(
    ["dataFromYoutube"],
    () => getJobInfo(url),
    { enabled: false }
  );

  const handleGrabClick = () => {
    setOptions([]);
    void refetch().then(({ data }) => {
      if (data) {
        setOptions(data.formats);
        setVideoId(data.videoId);
      }
    });
  };

  const handleUrlChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setUrl(e.target.value);
  const handleFormatChange: FormatsButtonGroupProps["onChange"] = (option) =>
    setSelectedFormat(option);
  const handleDownloadBtnClick = () => {
    if (selectedFormat?.itag && videoId) {
      void sendJobToQueue(videoId, `${selectedFormat.itag}`).then(() => {
        setOpen(true);
        setMsg("Your job is in the line now.");
      });
    }
  };

  useEffect(() => {
    if (Status.completed === status) {
      setDownloadUrl("");
      void refetchFiles();
    }
  }, [progress, refetchFiles, status]);

  useEffect(() => {
    setUrl("https://www.youtube.com/watch?v=veV2I-NEjaM");
  }, []);

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

        {!!options.length && (
          <div>
            <FormatsButtonGroup
              options={options}
              value={selectedFormat}
              onChange={handleFormatChange}
            />
            {selectedFormat && (
              <button
                className="btn-accent btn w-full"
                onClick={handleDownloadBtnClick}
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
      <Toast message={msg} open={open} onClose={() => setOpen(false)} />
    </main>
  );
};

export default Home;
