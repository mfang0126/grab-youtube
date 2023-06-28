export const isValidUrl = (url: string) =>
  /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/.test(
    url
  );

export const sanitizeFileName = (title: string, quality?: string) => {
  const fileName = title
    ? title.replaceAll('[\\\\/:*?"<>|]', "_").substring(0, 30)
    : new Date().getTime();

  return {
    audioName: `${fileName}.audio.mp4`,
    videoName: `${fileName}.video.mp4`,
    outputName: `${fileName}${quality ? `_${quality}` : ""}.mp4`,
  };
};
