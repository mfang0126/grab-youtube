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
    <div className="relative">
      <div className="flex-start text-md flex h-12 w-full overflow-hidden rounded bg-indigo-900 font-medium">
        <div
          className="flex h-full items-baseline justify-center overflow-hidden break-all bg-indigo-600"
          style={{ width: `${displayPercentage}%` }}
        ></div>
      </div>
      <div className="absolute left-0 top-0 flex h-full w-full justify-center">
        <div className="flex self-center font-medium text-white">
          {displayPercentage} %
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
