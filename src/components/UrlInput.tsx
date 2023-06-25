import {
  type FC,
  type MouseEventHandler,
  type ChangeEventHandler,
  useState,
} from "react";

export interface FormatsButtonGroupProps {
  value: string;
  onGrabButtonClick: MouseEventHandler<HTMLButtonElement>;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
}

const FormatsButtonGroup: FC<FormatsButtonGroupProps> = ({
  value,
  onGrabButtonClick,
  onInputChange,
}) => {
  return (
    <div className="join">
      <input
        type="text"
        placeholder="Paste your link here..."
        aria-label="URL"
        className="input-bordered input join-item w-full"
        onChange={onInputChange}
        value={value}
      />
      <button
        className="join-item btn rounded"
        type="button"
        onClick={onGrabButtonClick}
      >
        Grab
      </button>
    </div>
  );
};

export default FormatsButtonGroup;
