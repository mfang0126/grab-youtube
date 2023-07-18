const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;

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

export const getYouTubeVideoId = (url: string): string => {
  // each time
  // RegExp#exec() stores and depends on a property named .lastIndex inside the RegExp object to prevent re-matching. Don't use it; remove the g flag and use String#match(), or, if you need to match multiple times against the same string, String#matchAll().
  const match = YOUTUBE_REGEX.exec(url);
  if (match && match[1]) {
    return match[1];
  } else {
    return "";
  }
};
