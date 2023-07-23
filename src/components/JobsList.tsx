import type { JobItem } from "~/typing";

interface JobsListProps {
  jobs: JobItem[];
}

// TODO: Loading state
export default function JobsList({ jobs }: JobsListProps) {
  const [firstJob, ...restJobs] = jobs;

  if (!firstJob) {
    return null;
  }

  const { videoTitle, progress, formatItag } = firstJob;

  return (
    <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-4 font-semibold text-black">
      <div className="flex flex-col gap-2">
        <div className=" whitespace-nowrap">
          {videoTitle} - {formatItag}
        </div>
        <progress
          className="progress-secondary progress h-4 self-center"
          value={progress}
          max="100"
        ></progress>
      </div>
      <div className="divider">More jobs</div>
      <ul className="list-inside list-disc">
        {[...restJobs].map(({ _id, videoTitle, formatItag }) => (
          <li key={_id} className="vertical-middle">
            {videoTitle} - {formatItag}
          </li>
        ))}
      </ul>
    </div>
  );
}
