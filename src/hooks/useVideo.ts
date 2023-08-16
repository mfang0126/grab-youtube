import axios from "axios";
import { useState } from "react";
import type { VideoItem } from "~/typing";
import { isValidUrl } from "~/utils/stringHelper";

const useVideo = (url: string) => {
  const [isGrabbing, setGrabing] = useState(false);

  const fetch = async () => {
    try {
      if (url.length <= 24 && !isValidUrl(url)) {
        throw new Error("The video url is invalid.");
      }

      setGrabing(true);
      const { data } = await axios.get<VideoItem>("/api/video", {
        params: { url },
      });
      setGrabing(false);

      return data;
    } catch (error) {
      setGrabing(false);
      throw new Error((error as Error).message);
    }
  };

  return { fetch, isGrabbing };
};

export default useVideo;
