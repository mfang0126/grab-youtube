import { type FC, useState, useEffect } from "react";

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ percentage }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    // Round the percentage
    const roundedPercentage = Math.round(percentage);

    // Only update the displayPercentage state if the rounded value has changed
    if (roundedPercentage !== displayPercentage) {
      setDisplayPercentage(roundedPercentage);
    }
  }, [percentage, displayPercentage]);

  return (
    <div className="flex-start text-md flex h-10 w-full overflow-hidden rounded bg-white font-medium">
      <div
        className="flex h-full items-baseline justify-center overflow-hidden break-all bg-pink-500 text-white"
        style={{ width: `${displayPercentage}%` }}
      >
        <div className="self-center">{displayPercentage}% Completed</div>
      </div>
    </div>
  );
};

export default ProgressBar;
