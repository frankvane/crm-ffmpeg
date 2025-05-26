import { FFmpegSchemaMap } from "./types";

export const OPERATION_SCHEMAS: FFmpegSchemaMap = {
  scale: {
    label: "视频缩放",
    params: [
      {
        name: "width",
        label: "目标宽度",
        type: "number",
        min: 1,
        placeholder: "如 1280",
        defaultValue: 1280,
        description: "输出视频的目标宽度，单位为像素。",
      },
      {
        name: "height",
        label: "目标高度",
        type: "number",
        min: 1,
        placeholder: "如 720",
        defaultValue: 720,
        description: "输出视频的目标高度，单位为像素。",
      },
    ],
  },
  compress: {
    label: "视频压缩",
    params: [
      {
        name: "bitrate",
        label: "目标码率(kbps)",
        type: "number",
        min: 100,
        placeholder: "如 800",
        defaultValue: 800,
        description: "压缩后视频的目标码率，单位为kbps。",
      },
    ],
  },
  "extract-audio": {
    label: "转出音频",
    params: [
      {
        name: "audioFormat",
        label: "音频格式",
        type: "select",
        options: [
          { label: "MP3", value: "mp3" },
          { label: "WAV", value: "wav" },
        ],
        placeholder: "选择格式",
        defaultValue: "mp3",
        description: "导出音频的文件格式。",
      },
    ],
  },
  crop: {
    label: "裁剪",
    params: [
      {
        name: "x",
        label: "起始X",
        type: "number",
        min: 0,
        placeholder: "如 0",
        defaultValue: 0,
      },
      {
        name: "y",
        label: "起始Y",
        type: "number",
        min: 0,
        placeholder: "如 0",
        defaultValue: 0,
      },
      {
        name: "width",
        label: "宽度",
        type: "number",
        min: 1,
        placeholder: "如 640",
        defaultValue: 640,
      },
      {
        name: "height",
        label: "高度",
        type: "number",
        min: 1,
        placeholder: "如 360",
        defaultValue: 360,
      },
    ],
  },
  "clip-segment": {
    label: "截取片段",
    params: [
      {
        name: "start",
        label: "起始时间(秒)",
        type: "number",
        min: 0,
        placeholder: "如 10",
        defaultValue: 0,
      },
      {
        name: "duration",
        label: "持续时长(秒)",
        type: "number",
        min: 1,
        placeholder: "如 30",
        defaultValue: 10,
      },
    ],
  },
  watermark: {
    label: "加水印",
    params: [
      {
        name: "watermarkText",
        label: "水印文字",
        type: "text",
        placeholder: "如 MyWatermark",
        defaultValue: "watermark",
      },
      {
        name: "fontSize",
        label: "字体大小",
        type: "number",
        min: 10,
        placeholder: "如 24",
        defaultValue: 24,
      },
      {
        name: "opacity",
        label: "透明度(0-1)",
        type: "number",
        min: 0,
        max: 1,
        step: 0.1,
        placeholder: "如 0.5",
        defaultValue: 1.0,
      },
    ],
  },
  convert: {
    label: "格式转换",
    params: [
      {
        name: "format",
        label: "目标格式",
        type: "select",
        options: [
          { label: "MP4", value: "mp4" },
          { label: "AVI", value: "avi" },
          { label: "MOV", value: "mov" },
          { label: "MKV", value: "mkv" },
          { label: "FLV", value: "flv" },
        ],
        placeholder: "选择格式",
        defaultValue: "mp4",
      },
    ],
  },
  framerate: {
    label: "帧率调整",
    params: [
      {
        name: "fps",
        label: "目标帧率",
        type: "number",
        min: 1,
        max: 120,
        placeholder: "如 30",
        defaultValue: 30,
      },
    ],
  },
  volume: {
    label: "音量调整",
    params: [
      {
        name: "volume",
        label: "音量倍数",
        type: "number",
        min: 0,
        max: 10,
        step: 0.1,
        placeholder: "如 1.5",
        defaultValue: 1.0,
      },
    ],
  },
  gif: {
    label: "视频转GIF",
    params: [
      {
        name: "start",
        label: "起始时间(秒)",
        type: "number",
        min: 0,
        placeholder: "如 0",
        defaultValue: 0,
      },
      {
        name: "duration",
        label: "持续时长(秒)",
        type: "number",
        min: 1,
        placeholder: "如 5",
        defaultValue: 5,
      },
    ],
  },
  cover: {
    label: "提取封面",
    params: [
      {
        name: "time",
        label: "时间点(秒)",
        type: "number",
        min: 0,
        placeholder: "如 1",
        defaultValue: 1,
      },
    ],
  },
};
