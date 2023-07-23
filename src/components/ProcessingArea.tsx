import type { FC } from "react";
import type { ProcessingJobItem } from "~/typing";

interface ProcessingAreaProps {
  jobs: ProcessingJobItem[];
}

const ProcessingArea: FC<ProcessingAreaProps> = ({ jobs }) => {
  const firstJob = jobs[0];
  const restJobs = jobs.slice(1);

  if ((jobs.length = 0)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-4 font-semibold text-black">
      <div className="flex gap-4">
        <div className="whitespace-nowrap">{firstJob?.videoTitle}</div>
        <progress
          className="progress-secondary progress h-4 self-center"
          value={firstJob?.progress}
          max="100"
        ></progress>
      </div>
      {restJobs.map(({ _id, videoTitle, formatItag }) => (
        <div key={_id} className="text-right">
          {videoTitle} {formatItag}
        </div>
      ))}
    </div>
  );
};

export default ProcessingArea;
