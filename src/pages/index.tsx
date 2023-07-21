import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import { useEffect, useState, type ChangeEventHandler, type FC } from "react";
import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "~/components/FormatsButtonGroup";
import Toast from "~/components/Toast";
import UrlInput from "~/components/UrlInput";
import {
  getFilePaths,
  getJobInfo,
  sendJobToQueue,
} from "~/services/api-service";
import { type Format } from "~/typing";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [options, setOptions] = useState<Format[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  const { data: files } = useQuery(["filePaths"], getFilePaths);

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
        setJobId(data._id.toString());
      }
    });
  };

  const handleUrlChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setUrl(e.target.value);

  const handleFormatChange: FormatsButtonGroupProps["onChange"] = (option) =>
    setSelectedFormat(option);

  const handleDownloadBtnClick = () => {
    if (selectedFormat?.itag && jobId) {
      void sendJobToQueue(jobId, `${selectedFormat.itag}`).then(() => {
        setOpen(true);
        setMsg("Your job is in the line now.");
      });
    }
  };

  // TODO: Remove once finish testing.
  useEffect(() => {
    setUrl("https://www.youtube.com/watch?v=veV2I-NEjaM");
  }, []);

  return (
    <Wrapper>
      <PageHeading />
      <UrlInput
        value={url}
        isLoading={isGrabbing}
        onGrabButtonClick={handleGrabClick}
        onInputChange={handleUrlChange}
      />
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
      <Toast message={msg} open={open} onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

const PageHeading: FC = () => (
  <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
    Grab Your <span className="text-[hsl(280,100%,70%)]">Youtube</span>
  </h1>
);

const Wrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
    <div className="container flex max-w-max flex-col justify-center gap-12 px-4 py-16">
      {children}
    </div>
  </main>
);

export default Home;
