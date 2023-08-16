import React, { type FC, type ChangeEvent } from "react";
import type { videoFormat } from "ytdl-core";
import formatBytes from "~/utils/formatBytes";

export interface FormatsButtonGroupProps {
  options: videoFormat[];
  value: videoFormat | null;
  onChange: (value: videoFormat) => void;
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
    <div className="mb-6 grid w-full grid-cols-2 gap-4 md:grid-cols-2">
      {options.map((option) => (
        <div className="rounded-md bg-base-100 px-4" key={option.itag}>
          <label className="label cursor-pointer">
            <LabelText option={option} />
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
  );
};

const LabelText = ({ option }: { option: videoFormat }) => {
  const quality = option.qualityLabel || option.quality;
  const size = option.contentLength && formatBytes(option.contentLength);

  // TODO: It's only download and merge video and audio at the moment. split the video and audio download option out.
  return (
    <div className="flex gap-4">
      {quality && <span className="badge badge-primary">{quality}</span>}
      {size && <span className="badge badge-info">{size}</span>}
      {option.hasAudio && option.hasVideo && (
        <span className="badge badge-secondary">FAST</span>
      )}
      {!option.hasAudio && option.hasVideo && (
        <span className="badge badge-error">VIDEO ONLY</span>
      )}
      {option.hasAudio && !option.hasVideo && (
        <span className="badge badge-warning">AUDIO ONLY</span>
      )}
    </div>
  );
};

export default FormatsButtonGroup;
