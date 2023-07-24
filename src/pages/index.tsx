"use client";

import type { NextPage } from "next";
import { useEffect, useState, type ChangeEventHandler } from "react";
import useSWR from "swr";
import DownloadFiles from "~/components/DownloadFilesList";
import { type FormatsButtonGroupProps } from "~/components/FormatsButtonGroup";
import FormatSelection from "~/components/FormatsSelection";
import JobsList from "~/components/JobsList";
import Title from "~/components/Title";
import Toast from "~/components/Toast";
import UrlInput from "~/components/UrlInput";
import Wrapper from "~/components/Wrapper";
import useProgress from "~/hooks/useProgress";
import useToast from "~/hooks/useToast";
import {
  getFilePaths,
  getAllQueueJobs,
  getVideo,
  sendJobToQueue,
} from "~/services/api-service";
import { type Format } from "~/typing";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [live, setLive] = useState(false);
  const [options, setOptions] = useState<Format[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  const { data: files } = useSWR("/api/files-path", getFilePaths);
  const { data: jobs, mutate: mutateJobs } = useSWR("jobs", () =>
    getAllQueueJobs()
  );
  const { isLoading: isGrabbing, mutate } = useSWR("videos", async () => {
    if (url) {
      const videos = await getVideo(url);
      return videos;
    }
  });

  const { toast } = useToast();
  const progress = useProgress(live);

  const handleGrabClick = () => {
    setOptions([]);
    void mutate().then((data) => {
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
      void sendJobToQueue(jobId, `${selectedFormat.itag}`)
        .then(() => {
          toast({
            message:
              "Your job is in the line now and check your download status at the bottom of the page",
          });
        })
        .then(() => mutateJobs());
    }
  };

  const handleLiveButton = () => setLive(!live);

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

      {options.length > 0 && (
        <FormatSelection
          options={options ?? []}
          value={selectedFormat}
          onChange={handleFormatChange}
          onClick={handleDownloadBtnClick}
        />
      )}

      {!!files?.length && <DownloadFiles files={files} />}

      {!!jobs?.length && (
        <JobsList
          jobs={jobs}
          progress={progress}
          action={
            <button
              className={`${live ? "btn-error" : "btn-ghost"} btn`}
              onClick={handleLiveButton}
            >
              {live ? "Stop" : "Live"}
            </button>
          }
        />
      )}
    </Wrapper>
  );
};

export default Home;
