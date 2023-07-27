"use client";

import type { NextPage } from "next";
import { useEffect, useState, type ChangeEventHandler } from "react";
import useSWR from "swr";
import DownloadFiles from "~/components/DownloadFilesList";
import { type FormatsButtonGroupProps } from "~/components/FormatsButtonGroup";
import FormatSelection, {
  type FormatSelectionProps,
} from "~/components/FormatsSelection";
import JobsList from "~/components/JobsList";
import { ProgressJob } from "~/components/ProgressJob";
import Title from "~/components/Title";
import UrlInput, { type UrlInputProps } from "~/components/UrlInput";
import Wrapper from "~/components/Wrapper";
import useProgress from "~/hooks/useProgress";
import useToast from "~/hooks/useToast";
import {
  getJobsByStatus,
  getCronTriggered,
  getFilePaths,
  getVideo,
  sendJobToQueue,
} from "~/services/api-service";
import { Status, type Format } from "~/typing";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [live, setLive] = useState(false);
  const [options, setOptions] = useState<Format[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  const { data: files } = useSWR("/files-path", getFilePaths);
  const { data: jobs, mutate: mutateJobs } = useSWR(
    "getReadyJobs",
    async () => {
      const jobs = await getJobsByStatus([
        Status.merging,
        Status.downloading,
        Status.ready,
      ]);
      return jobs || [];
    }
  );
  const { data: readyJobs, mutate: mutateReadyJobs } = useSWR(
    "getAllJobs",
    () => getJobsByStatus()
  );
  const { data: runningJob, mutate: mutateRunningJob } = useSWR(
    "getRunningJob",
    async () => {
      const [job] = await getJobsByStatus([Status.merging, Status.downloading]);
      return job;
    }
  );
  const { isLoading: isGrabbing, mutate: mutateVideo } = useSWR(
    "getVideoInfo",
    async () => {
      if (url) {
        const videos = await getVideo(url);
        return videos;
      }
    }
  );

  const { toast } = useToast();
  const { progress: progressNum, status: progressStatus } = useProgress(
    live,
    runningJob
  );

  const handleGrabClick: UrlInputProps["onGrabButtonClick"] = async () => {
    setOptions([]);
    const newVideos = await mutateVideo();
    if (newVideos) {
      setOptions(newVideos.formats);
      setJobId(newVideos._id.toString());
    }
  };

  const handleUrlChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setUrl(e.target.value);

  const handleFormatChange: FormatsButtonGroupProps["onChange"] = (option) =>
    setSelectedFormat(option);

  const handleDownloadClick: FormatSelectionProps["onDownloadClick"] =
    async () => {
      if (selectedFormat?.itag && jobId) {
        await sendJobToQueue(jobId, `${selectedFormat.itag}`);
        await mutateReadyJobs();

        toast({
          message: "The job will be started in 3 seconds",
          autoHideDuration: 3000,
        });

        void getCronTriggered();

        setTimeout(() => {
          void (async () => {
            await mutateRunningJob();
            setLive(true);
          })();
        }, 1000);
      }
    };

  const handleLiveButton = async () => {
    console.log(runningJob);
    if (runningJob) {
      setLive(true);
    }

    if (!runningJob) {
      const allJobs = await mutateJobs();
      const hasRunningJob = allJobs?.some(
        (job) =>
          job.status &&
          [Status.downloading, Status.merging].includes(job.status)
      );

      if (hasRunningJob) {
        setLive(true);
      }

      if (!hasRunningJob) {
        const hasReadyJob = allJobs?.filter(
          (job) => job.status === Status.ready
        );

        if (hasReadyJob) {
          void getCronTriggered();

          setTimeout(() => {
            void (async () => {
              await mutateRunningJob();
              toast({ message: "Start running new jobs from the jobs list." });
              setLive(true);
            })();
          }, 1000);
        }
      }
    }

    setLive(!live);
  };

  // TODO: Remove once finish testing.
  useEffect(() => {
    if (runningJob) {
      if (readyJobs?.length) {
        setLive(true);
      }
      if (progressStatus === Status.completed) {
        void mutateJobs();
        toast({ message: `Complete Job: ${runningJob.videoTitle}.` });
      }
      if (progressStatus === Status.downloading) {
        toast({ message: `Running Job: ${runningJob.videoTitle}.` });
      }
    }

    if (progressStatus === Status.completed && !runningJob) {
      setLive(false);
    }

    setUrl("https://www.youtube.com/watch?v=veV2I-NEjaM");
  }, [progressStatus, readyJobs?.length, runningJob, toast]);

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
          onDownloadClick={handleDownloadClick}
        />
      )}

      {!!files?.length && <DownloadFiles files={files} />}

      {!!jobs?.length && (
        <JobsList
          jobs={jobs}
          progressJob={
            runningJob && (
              <ProgressJob
                progress={progressNum}
                quality={runningJob.videoQuality}
                title={runningJob.videoTitle}
              />
            )
          }
          action={
            <button
              className={`${live ? "btn-error" : "btn-ghost"} btn`}
              onClick={() => void handleLiveButton()}
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
