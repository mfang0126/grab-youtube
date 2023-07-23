import type { DownloadFile } from "~/typing";
import Heading from "./Heading";

interface DownloadFilesProps {
  files: DownloadFile[];
}

// TODO: Loading state
export default function DownloadFiles({ files }: DownloadFilesProps) {
  return (
    <div>
      <Heading>Click to Download</Heading>
      <div className="flex flex-col justify-center gap-4">
        {files?.map(({ name, path }) => (
          <a
            key={name}
            href={path}
            target="_blank"
            className="btn-info btn-outline btn"
          >
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
