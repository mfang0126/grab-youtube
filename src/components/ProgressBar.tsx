import { FC } from "react";

interface ProgressBarProps {
  percentage: number;
}
const ProgressBar: FC<ProgressBarProps> = ({ percentage }) => {
  const progress = Math.round(percentage);

  return (
    <div className="flex-start text-md flex h-10 w-full overflow-hidden rounded font-medium">
      <div
        className="flex h-full items-baseline justify-center overflow-hidden break-all bg-pink-500 text-white"
        style={{ width: `${progress}%` }}
      >
        <div className="self-center">{progress}% Completed</div>
      </div>
    </div>
  );
};

export default ProgressBar;
