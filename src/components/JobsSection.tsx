import { type JobItem } from "~/typing";
import Heading from "./Heading";

interface JobsTableProps {
  jobs: JobItem[];
  action?: React.ReactNode;
  progressSection?: React.ReactNode;
  jobsSection?: React.ReactNode;
}

/**
 * TODO: Loading state
 * Live progress for the current job.
 * Standby jobs will be in the list.
 * As default it will be paused.
 *
 */
export default function JobsSection({
  action,
  progressSection,
  jobsSection,
}: JobsTableProps) {
  return (
    <div className="max-w-4xl">
      <div className="flex justify-between">
        <Heading>Download List</Heading>
        {action}
      </div>
      <div className="flex flex-col gap-4">
        {progressSection}
        {jobsSection}
      </div>
    </div>
  );
}
