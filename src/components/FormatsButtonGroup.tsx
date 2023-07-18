import React, { type FC, type ChangeEvent } from "react";
import { type Format } from "~/typing";

export interface FormatsButtonGroupProps {
  options: Format[];
  value: Format | null;
  onChange: (value: Format) => void;
}

const FormatsButtonGroup: FC<FormatsButtonGroupProps> = ({
  options,
  value,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedOption = options.find(
      (option) => `${option.itag}` === event.target.value
    );
    selectedOption && onChange(selectedOption);
  };

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">
        Select Formats
      </h1>
      <div className="mb-6 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
        {options.map((option) => (
          <div className="rounded-md bg-base-100 px-4" key={option.itag}>
            <label className="label cursor-pointer">
              <span className="label-text">
                {option.itag} - {option.qualityLabel || option.quality}
              </span>
              {option.hasAudio && option.hasVideo && (
                <div className="badge badge-secondary">FAST</div>
              )}
              <input
                type="radio"
                name="formats"
                value={option.itag}
                checked={value?.itag === option.itag}
                onChange={handleChange}
                className="radio checked:bg-red-500"
              />
            </label>
          </div>
        ))}
      </div>
    </>
  );
};

export default FormatsButtonGroup;
