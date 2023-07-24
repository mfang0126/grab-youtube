import type { Format } from "~/typing";
import FormatsButtonGroup, {
  type FormatsButtonGroupProps,
} from "./FormatsButtonGroup";
import Heading from "./Heading";

interface FormatSelectionProps {
  options: Format[];
  value: Format | null;
  onChange: FormatsButtonGroupProps["onChange"];
  onClick: () => void;
}

export default function FormatSelection({
  onClick,
  value,
  ...rest
}: FormatSelectionProps) {
  return (
    <div>
      <Heading>Select Formats</Heading>
      <FormatsButtonGroup value={value} {...rest} />
      {value && (
        <button className="btn-accent btn w-full" onClick={onClick}>
          Download
        </button>
      )}
    </div>
  );
}
