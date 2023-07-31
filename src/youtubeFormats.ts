export type VideoFormat = {
  resolution: string;
  label: string;
  format: string;
};

export type AudioFormat = {
  container: string;
  codec: string;
  bitrate: string;
  channels: string;
};

export const VideoFormatMap: Record<string, VideoFormat> = {
  "402": { resolution: "4320p", label: "av1 hfr high", format: "mp4" },
  "571": { resolution: "4320p", label: "av1 hfr high", format: "mp4" },
  "272": { resolution: "4320p", label: "av1 hfr", format: "mp4" },
  "701": { resolution: "2160p", label: "av1 hfr high", format: "mp4" },
  "401": { resolution: "2160p", label: "av1 hfr", format: "mp4" },
  "337": { resolution: "2160p", label: "av1", format: "mp4" },
  "315": { resolution: "2160p", label: "vp9.2 hdr hfr", format: "webm" },
  "313": { resolution: "2160p", label: "vp9 hfr", format: "webm" },
  "305": { resolution: "2160p", label: "vp9", format: "webm" },
  "266": { resolution: "2160p", label: "h.264", format: "mp4" },
  "700": { resolution: "1440p", label: "av1 hfr high", format: "mp4" },
  "400": { resolution: "1440p", label: "av1 hfr", format: "mp4" },
  "336": { resolution: "1440p", label: "av1", format: "mp4" },
  "308": { resolution: "1440p", label: "vp9.2 hdr hfr", format: "webm" },
  "271": { resolution: "1440p", label: "vp9 hfr", format: "webm" },
  "304": { resolution: "1440p", label: "vp9", format: "webm" },
  "264": { resolution: "1440p", label: "h.264", format: "mp4" },
  "699": { resolution: "1080p", label: "av1 hfr high", format: "mp4" },
  "399": { resolution: "1080p", label: "av1 hfr", format: "mp4" },
  "335": { resolution: "1080p", label: "av1", format: "mp4" },
  "303": { resolution: "1080p", label: "vp9.2 hdr hfr", format: "webm" },
  "248": { resolution: "1080p", label: "vp9 hfr", format: "webm" },
  "299": { resolution: "1080p", label: "vp9", format: "webm" },
  "137": { resolution: "1080p", label: "h.264", format: "mp4" },
  "698": { resolution: "720p", label: "av1 hfr high", format: "mp4" },
  "398": { resolution: "720p", label: "av1 hfr", format: "mp4" },
  "334": { resolution: "720p", label: "av1", format: "mp4" },
  "302": { resolution: "720p", label: "vp9.2 hdr hfr", format: "webm" },
  "247": { resolution: "720p", label: "vp9 hfr", format: "webm" },
  "298": { resolution: "720p", label: "vp9", format: "webm" },
  "136": { resolution: "720p", label: "h.264", format: "mp4" },
  "697": { resolution: "480p", label: "av1 hfr high", format: "mp4" },
  "397": { resolution: "480p", label: "av1 hfr", format: "mp4" },
  "333": { resolution: "480p", label: "av1", format: "mp4" },
  "244": { resolution: "480p", label: "vp9 hfr", format: "webm" },
  "135": { resolution: "480p", label: "h.264", format: "mp4" },
  "696": { resolution: "360p", label: "av1 hfr high", format: "mp4" },
  "396": { resolution: "360p", label: "av1 hfr", format: "mp4" },
  "332": { resolution: "360p", label: "av1", format: "mp4" },
  "243": { resolution: "360p", label: "vp9 hfr", format: "webm" },
  "134": { resolution: "360p", label: "h.264", format: "mp4" },
  "695": { resolution: "240p", label: "av1 hfr high", format: "mp4" },
  "395": { resolution: "240p", label: "av1 hfr", format: "mp4" },
  "331": { resolution: "240p", label: "av1", format: "mp4" },
  "242": { resolution: "240p", label: "vp9 hfr", format: "webm" },
  "133": { resolution: "240p", label: "h.264", format: "mp4" },
  "694": { resolution: "144p", label: "av1 hfr high", format: "mp4" },
  "394": { resolution: "144p", label: "av1 hfr", format: "mp4" },
  "330": { resolution: "144p", label: "av1", format: "mp4" },
  "278": { resolution: "144p", label: "vp9", format: "webm" },
  "160": { resolution: "144p", label: "h.264", format: "mp4" },
};

export const AudioFormatMap: Record<string, AudioFormat> = {
  "139": {
    container: "MP4",
    codec: "AAC (HE v1)",
    bitrate: "48 Kbps",
    channels: "Stereo (2)",
  },
  "140": {
    container: "MP4",
    codec: "AAC (LC)",
    bitrate: "128 Kbps",
    channels: "Stereo (2)",
  },
  "141": {
    container: "MP4",
    codec: "AAC (LC)",
    bitrate: "256 Kbps",
    channels: "Stereo (2)",
  },
  "249": {
    container: "WebM",
    codec: "Opus (VBR)",
    bitrate: "~50 Kbps",
    channels: "Stereo (2)",
  },
  "250": {
    container: "WebM",
    codec: "Opus (VBR)",
    bitrate: "~70 Kbps",
    channels: "Stereo (2)",
  },
  "251": {
    container: "WebM",
    codec: "Opus (VBR)",
    bitrate: "<=160 Kbps",
    channels: "Stereo (2)",
  },
  "256": {
    container: "MP4",
    codec: "AAC (HE v1)",
    bitrate: "192 Kbps",
    channels: "Surround (5.1)",
  },
  "258": {
    container: "MP4",
    codec: "AAC (LC)",
    bitrate: "384 Kbps",
    channels: "Surround (5.1)",
  },
  "327": {
    container: "MP4",
    codec: "AAC (LC)",
    bitrate: "256 Kbps",
    channels: "Surround (5.1)",
  },
  "338": {
    container: "WebM",
    codec: "Opus (VBR)",
    bitrate: "~480 Kbps",
    channels: "Quadraphonic (4)",
  },
};
