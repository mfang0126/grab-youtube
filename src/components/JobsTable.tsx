import { Status, type JobItem } from "~/typing";
import Heading from "./Heading";
import { getQualityByItag } from "~/utils/stringHelper";

interface JobsTableProps {
  jobs: JobItem[];
  action?: React.ReactNode;
  progressJob?: React.ReactNode;
}

/**
 * TODO: Loading state
 * Live progress for the current job.
 * Standby jobs will be in the list.
 * As default it will be paused.
 *
 */
export default function JobsTable({
  jobs,
  action,
  progressJob,
}: JobsTableProps) {
  return (
    <div className="max-w-4xl">
      <div className="flex justify-between">
        <Heading>Download List</Heading>
        {action}
      </div>
      <div className="flex flex-col gap-4">
        {progressJob && (
          <div className="flex flex-col gap-2 rounded-md bg-slate-100 p-4 font-semibold text-black">
            <div className="flex flex-col gap-2">{progressJob}</div>
          </div>
        )}
        <div className="flex flex-col gap-2 rounded-md bg-slate-900 p-4 ">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quality</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(
                  ({ _id, videoTitle, formatItag, progress, status }) => (
                    <tr key={_id}>
                      <td>{_id.substring(0, 8)}</td>
                      <td>{videoTitle}</td>
                      <td>{getQualityByItag(formatItag)}</td>
                      <td>{progress} %</td>
                      <td>{status}</td>
                      <td>
                        <button className="btn-primary btn-xs btn">
                          Download
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
