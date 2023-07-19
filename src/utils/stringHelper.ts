const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
const VIDEO_ID_REGEX = /\/watch\?v=([a-zA-Z0-9-_]+)/;
const VIDEO_ID_VALIDATION_REGEX = /^[A-Za-z0-9_-]{11}$/;

export const isValidUrl = (url: string) => YOUTUBE_REGEX.test(url);

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

// https://youtu.be/iHE8dh_fggs
// https://www.youtube.com/watch?v=iHE8dh_fggs
// https://www.youtube.com/embed/iHE8dh_fggs
export const getYouTubeVideoId = (url: string): string => {
  if (!url.match(VIDEO_ID_REGEX)) {
    return "";
  }

  const match = url.match(VIDEO_ID_REGEX);
  const videoId = match?.[1];
  if (videoId && !videoId.match(VIDEO_ID_VALIDATION_REGEX)) {
    return "";
  }

  return videoId ?? "";
};
