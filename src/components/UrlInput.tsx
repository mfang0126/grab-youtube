import { type FC, type ChangeEventHandler, type MouseEvent } from "react";

export interface UrlInputProps {
  value: string;
  isLoading?: boolean;
  onGrabButtonClick: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
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
        onClick={(e) => void onGrabButtonClick(e)}
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
