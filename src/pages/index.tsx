"use client";

import type { NextPage } from "next";
import { useEffect, useState, type ChangeEventHandler } from "react";
import useSWR from "swr";
import DownloadFiles from "~/components/DownloadFilesList";
import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "~/components/FormatsButtonGroup";
import Heading from "~/components/Heading";
import JobsList from "~/components/JobsList";
import Title from "~/components/Title";
import Toast from "~/components/Toast";
import UrlInput from "~/components/UrlInput";
import Wrapper from "~/components/Wrapper";
import {
  getJobsFromQueue,
  getFilePaths,
  sendJobToQueue,
  getVideos,
} from "~/services/api-service";
import { type Format } from "~/typing";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [options, setOptions] = useState<Format[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  const { data: files } = useSWR("files", getFilePaths);
  const { data: jobs } = useSWR("jobs", getJobsFromQueue);
  const { isLoading: isGrabbing, mutate } = useSWR("videos", async () => {
    if (url) {
      const videos = await getVideos(url);
      return videos;
    }
  });

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
      <DownloadFiles files={files ?? []} />
      <JobsList jobs={jobs ?? []} />
      <Toast message={msg} open={open} onClose={() => setOpen(false)} />
    </Wrapper>
  );
};

export default Home;
