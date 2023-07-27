import { Status, type JobItem } from "~/typing";
import Heading from "./Heading";

interface JobsListProps {
  jobs: JobItem[];
  action?: React.ReactNode;
  progressJob?: React.ReactNode;
}

/**
 * TODO: Loading state
 * Live progress for the current job.
 * Standby jobs will be in the list.
 * As default it will be paused.
 *
 */
export default function JobsList({ jobs, action, progressJob }: JobsListProps) {
  const restJobs = jobs.filter((job) => job.status !== Status.downloading);

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between">
        <Heading>Download List</Heading>
        {action}
      </div>
      <div className="flex flex-col gap-4">
        {progressJob && (
          <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-4 font-semibold text-black">
            <div className="flex flex-col gap-2">{progressJob}</div>
          </div>
        )}
        <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-4 font-semibold text-black">
          TODO:
          <ul className="list-inside list-disc">
            {[...restJobs].map(({ _id, videoTitle, formatItag }) => (
              <li
                key={_id}
                className="vertical-middle truncate whitespace-nowrap"
              >
                {videoTitle} - {formatItag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
