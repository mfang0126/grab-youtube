export const isValidUrl = (url: string) =>
  /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/.test(
    url
  );

export const sanitizeFileName = (title: string) =>
  title
    ? `${title.replaceAll(" ", "_").substring(0, 20)}.mp4`
    : `${new Date().getTime()}.mp4`;
