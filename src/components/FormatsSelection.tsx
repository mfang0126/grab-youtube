import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "./FormatsButtonGroup";
import Heading from "./Heading";
import type { MouseEvent } from "react";
import type { videoFormat } from "ytdl-core";

export interface FormatSelectionProps {
  options: videoFormat[];
  value: videoFormat | null;
  onChange: FormatsButtonGroupProps["onChange"];
  onDownloadClick: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export default function FormatSelection({
  onDownloadClick,
  value,
  ...rest
}: FormatSelectionProps) {
  return (
    <div>
      <Heading>Select Formats</Heading>
      <FormatsButtonGroup value={value} {...rest} />
      {value && (
        <button
          className="btn-accent btn w-full"
          onClick={(e) => void onDownloadClick(e)}
        >
          Download
        </button>
      )}
    </div>
  );
}
