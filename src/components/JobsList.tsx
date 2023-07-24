import { Status, type JobItem } from "~/typing";
import Heading from "./Heading";

interface JobsListProps {
  jobs: JobItem[];
  progress?: number;
  action?: React.ReactNode;
}

/**
 * TODO: Loading state
 * Live progress for the current job.
 * Standby jobs will be in the list.
 * As default it will be paused.
 *
 */
export default function JobsList({ jobs, progress, action }: JobsListProps) {
  const downloadingJob = jobs.find((job) => job.status === Status.downloading);
  const restJobs = jobs.filter((job) => job.status !== Status.downloading);

  return (
    <div>
      <div className="flex justify-between">
        <Heading>Download List</Heading>
        {action}
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-4 font-semibold text-black">
        {downloadingJob && (
          <div className="flex flex-col gap-2">
            <div className=" whitespace-nowrap">
              {downloadingJob.videoTitle} - {downloadingJob.formatItag}
            </div>
            <progress
              className="progress-secondary progress h-4 self-center"
              value={progress ?? downloadingJob.progress}
              max="100"
            ></progress>
          </div>
        )}

        <div className="divider">What&apos;s next</div>
        <ul className="list-inside list-disc">
          {[...restJobs].map(({ _id, videoTitle, formatItag }) => (
            <li key={_id} className="vertical-middle">
              {videoTitle} - {formatItag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
