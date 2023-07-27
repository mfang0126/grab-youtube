import type { FC } from "react";

interface ProgressJobProps {
  progress: number;
  quality: string;
  title: string;
}

export const ProgressJob: FC<ProgressJobProps> = ({
  progress,
  title,
  quality,
}) => {
  return (
    <>
      <div className="truncate whitespace-nowrap">
        {`${title} ${quality ? ` - ${quality}` : ""}`}
      </div>
      <progress
        className="progress-secondary progress h-4 self-center"
        value={progress}
        max="100"
      ></progress>
    </>
  );
};
