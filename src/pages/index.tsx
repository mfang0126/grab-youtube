import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import { useEffect, useState, type ChangeEventHandler } from "react";
import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "~/components/FormatsButtonGroup";
import Heading from "~/components/Heading";
import ProcessingArea from "~/components/ProcessingArea";
import Title from "~/components/Title";
import Toast from "~/components/Toast";
import UrlInput from "~/components/UrlInput";
import Wrapper from "~/components/Wrapper";
import {
  getAllJobsInQueue,
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

  const { data: files } = useQuery(["filePaths"], getFilePaths, {
    initialData: [],
  });

  const { data: processingJobs } = useQuery(
    ["processingJobs"],
    getAllJobsInQueue,
    { initialData: [] }
  );
  // console.log(processingJobs, files);

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
      <Title />
      <UrlInput
        value={url}
        isLoading={isGrabbing}
        onGrabButtonClick={handleGrabClick}
        onInputChange={handleUrlChange}
      />

      {!!options.length && (
        <div>
          <Heading>Select Formats</Heading>
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

      {!!files.length && (
        <div>
          <Heading>Click to Download</Heading>
          <div className="flex flex-col justify-center gap-4">
            {files?.map((file) => (
              <a
                key={file.name}
                href={file.path}
                target="_blank"
                className="btn-info btn-outline btn"
              >
                {file.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {!!processingJobs.length && <ProcessingArea jobs={processingJobs} />}

      <Toast message={msg} open={open} onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

export default Home;
