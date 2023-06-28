import {
  type FC,
  type MouseEventHandler,
  type ChangeEventHandler,
} from "react";

export interface UrlInputProps {
  value: string;
  isLoading?: boolean;
  onGrabButtonClick: MouseEventHandler<HTMLButtonElement>;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
}

const UrlInput: FC<UrlInputProps> = ({
  value,
  onGrabButtonClick,
  onInputChange,
  isLoading,
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
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-infinity loading-lg"></span>
        ) : (
          "Grab"
        )}
      </button>
    </div>
  );
};

export default UrlInput;
