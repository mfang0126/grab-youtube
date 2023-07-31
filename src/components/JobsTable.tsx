import { Status, type JobItem } from "~/typing";
import { getQualityByItag } from "~/utils/stringHelper";

interface JobsTableProps {
  jobs: JobItem[];
  onRowDownloadClick?: (id: string) => void;
}

export default function JobsTable({
  jobs,
  onRowDownloadClick,
}: JobsTableProps) {
  return (
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
            {jobs.map(({ _id, videoTitle, formatItag, progress, status }) => (
              <tr key={_id}>
                <td>{_id.substring(0, 8)}</td>
                <td>{videoTitle}</td>
                <td>{getQualityByItag(formatItag)}</td>
                <td>{progress} %</td>
                <td>{status}</td>
                <td>
                  <button
                    disabled={
                      status &&
                      [
                        Status.downloading,
                        Status.completed,
                        Status.merging,
                      ].includes(status)
                    }
                    className="btn-primary btn-xs btn"
                    onClick={() => onRowDownloadClick?.(_id)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
