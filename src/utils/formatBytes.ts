export default function formatBytes(bytes: string) {
  const cleanedBytes = Number(bytes);
  if (!cleanedBytes) {
    return;
  }
  const units = ["bytes", "KB", "MB", "GB", "TB"];
  let convertedValue = cleanedBytes;
  let unitIndex = 0;

  while (convertedValue >= 1024 && unitIndex < units.length - 1) {
    convertedValue /= 1024;
    unitIndex++;
  }

  // Not useful.
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${convertedValue.toFixed(2)} ${units[unitIndex]}`;
}
