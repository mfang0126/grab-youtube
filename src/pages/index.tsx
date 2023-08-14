"use client";

import type { NextPage } from "next";
import { useEffect, useMemo, useState, type ChangeEventHandler } from "react";
import useSWR from "swr";
import type { videoFormat } from "ytdl-core";
import DownloadFiles from "~/components/DownloadFilesList";
import { type FormatsButtonGroupProps } from "~/components/FormatsButtonGroup";
import FormatSelection, {
  type FormatSelectionProps,
} from "~/components/FormatsSelection";
import JobsSection from "~/components/JobsSection";
import JobsTable from "~/components/JobsTable";
import Title from "~/components/Title";
import UrlInput, { type UrlInputProps } from "~/components/UrlInput";
import Wrapper from "~/components/Wrapper";
import useProgress from "~/hooks/useProgress";
import useToast from "~/hooks/useToast";
import {
  getCronTriggered,
  getFiles,
  getJobsByStatus,
  getVideo,
  addNewJob,
  startDownloadJob,
} from "~/services/api-service";
import {
  Status,
  type VideoItem,
  type DownloadFile,
  type JobItem,
} from "~/typing";
import { cleanJobId } from "~/utils/stringHelper";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [live, setLive] = useState(false);
  const [options, setOptions] = useState<videoFormat[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<videoFormat | null>(
    null
  );

  const {
    error: errorVideo,
    mutate: mutateVideo,
    isValidating: isGrabbing,
  } = useSWR<VideoItem, Error>(url, getVideo);
  const {
    data: files,
    mutate: mutateFiles,
    error: errorFiles,
  } = useSWR<DownloadFile[], Error>("/api/files", getFiles);
  const {
    data: jobs,
    mutate: mutateJobs,
    error: errorJobs,
  } = useSWR<JobItem[], Error>([Status.completed, Status.ready], () =>
    getJobsByStatus()
  );
  const {
    data: runningJob,
    mutate: mutateRunningJob,
    error: errorRunningJob,
  } = useSWR<JobItem | undefined, Error>(
    [Status.downloading, Status.merging, selectedFormat?.itag],
    async (status: Status[]) => {
      const jobs = await getJobsByStatus(status);
      return jobs.find(
        ({ status: jobStatus }) => jobStatus && status.includes(jobStatus)
      );
    }
  );

  const otherJobs = useMemo(
    () =>
      jobs?.filter(
        ({ status }) =>
          status && ![Status.downloading, Status.merging].includes(status)
      ) ?? [],
    [jobs]
  );

  const { toast } = useToast();
  const { progress: progressNum, status: progressStatus } = useProgress(
    live,
    runningJob
  );

  const handleGrabClick: UrlInputProps["onGrabButtonClick"] = async () => {
    const newVideos = await mutateVideo();
    setOptions([]);

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
        await addNewJob(jobId, `${selectedFormat.itag}`);

        if (runningJob) {
          toast({
            message: "Add job to the list...",
          });
          return;
        }
        await mutateJobs();

        void getCronTriggered();

        const retry = setInterval(() => {
          void (async () => {
            toast({
              message: "Trying to start the job...",
            });

            const newRunningJob = await mutateRunningJob();
            if (newRunningJob) {
              setLive(true);
              toast({
                message: `Found a running job with id ${cleanJobId(
                  newRunningJob._id
                )}.`,
              });
              clearInterval(retry);
            }
          })();
        }, 3000);
      }
    };

  // Don't know if it's useful.
  const handleLiveButton = async () => {
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
          void mutateJobs();

          setTimeout(() => {
            toast({ message: "Start running new jobs from the jobs list." });
            setLive(true);
          }, 3000);
        }
      }
    }

    setLive(!live);
  };

  const handleRowDownloadClick = (id: string) => {
    void startDownloadJob(id);
    toast({ message: `Job ${id.substring(0, 8)}: Download started.` });
  };

  // TODO: Move to custom hook.
  useEffect(() => {
    if (runningJob) {
      setLive(true);
      if (progressStatus === Status.completed) {
        void mutateJobs();
        void mutateRunningJob();
        void mutateFiles();

        setLive(false); // Remove this line once we support continue downloading in the background.

        toast({ message: `Complete Job: ${runningJob.videoTitle}.` });
      }
      if (progressStatus === Status.downloading) {
        toast({ message: `Running Job: ${runningJob.videoTitle}.` });
      }
    }

    if (progressStatus === Status.completed && !runningJob) {
      setLive(false);
    }
  }, [
    mutateFiles,
    mutateJobs,
    mutateRunningJob,
    progressStatus,
    runningJob,
    toast,
  ]);

  // TODO: Move to custom hook.
  useEffect(() => {
    if (errorVideo) {
      toast({ message: "Error on fetching video formats." });
    }
    if (errorFiles) {
      toast({ message: "Error on file list." });
    }
    if (errorRunningJob) {
      toast({ message: "Error on fetching running jobs list." });
    }
    if (errorJobs) {
      toast({ message: "Error on fetching jobs list." });
    }
  }, [toast, errorVideo, errorFiles, errorRunningJob, errorJobs]);

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

      {!!otherJobs?.length && (
        <JobsSection
          jobs={otherJobs}
          action={
            <button
              className={`${live ? "btn-error" : "btn-ghost"} btn`}
              onClick={() => void handleLiveButton()}
            >
              {live ? "Hide live Progress" : "Show live Progress"}
            </button>
          }
          progressSection={
            runningJob && (
              <JobsTable
                jobs={[
                  {
                    ...runningJob,
                    progress: progressNum,
                    status: progressStatus,
                  },
                ]}
              />
            )
          }
          jobsSection={
            <JobsTable
              jobs={otherJobs}
              onRowDownloadClick={handleRowDownloadClick}
            />
          }
        />
      )}
    </Wrapper>
  );
};

export default Home;
