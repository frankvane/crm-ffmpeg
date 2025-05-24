import "./style.less";

import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Progress,
  Select,
  Switch,
} from "antd";
import React, { useState } from "react";

// 类型定义
interface ParamSchema {
  name: string;
  label: string;
  type: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: { label: string; value: string }[];
}
interface OperationSchema {
  label: string;
  params: ParamSchema[];
}

// 操作类型与参数schema定义
const OPERATION_SCHEMAS: Record<string, OperationSchema> = {
  scale: {
    label: "视频缩放",
    params: [
      {
        name: "width",
        label: "目标宽度",
        type: "number",
        min: 1,
        placeholder: "如 1280",
      },
      {
        name: "height",
        label: "目标高度",
        type: "number",
        min: 1,
        placeholder: "如 720",
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
          { label: "AAC", value: "aac" },
          { label: "WAV", value: "wav" },
        ],
        placeholder: "选择格式",
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
      },
      {
        name: "y",
        label: "起始Y",
        type: "number",
        min: 0,
        placeholder: "如 0",
      },
      {
        name: "width",
        label: "宽度",
        type: "number",
        min: 1,
        placeholder: "如 640",
      },
      {
        name: "height",
        label: "高度",
        type: "number",
        min: 1,
        placeholder: "如 360",
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
      },
      {
        name: "duration",
        label: "持续时长(秒)",
        type: "number",
        min: 1,
        placeholder: "如 30",
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
      },
      {
        name: "fontSize",
        label: "字体大小",
        type: "number",
        min: 10,
        placeholder: "如 24",
      },
      {
        name: "opacity",
        label: "透明度(0-1)",
        type: "number",
        min: 0,
        max: 1,
        step: 0.1,
        placeholder: "如 0.5",
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
      },
      {
        name: "duration",
        label: "持续时长(秒)",
        type: "number",
        min: 1,
        placeholder: "如 5",
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
      },
    ],
  },
};

const OPERATION_OPTIONS = Object.entries(OPERATION_SCHEMAS).map(
  ([value, { label }]) => ({ label, value })
);

const FFmpegPanel: React.FC = () => {
  const [operation, setOperation] =
    useState<keyof typeof OPERATION_SCHEMAS>("scale");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [form] = Form.useForm();

  // 根据schema渲染参数表单
  const renderParams = () => {
    const params = OPERATION_SCHEMAS[operation]?.params || [];
    return params.map((param: ParamSchema) => {
      switch (param.type) {
        case "number":
          return (
            <Form.Item key={param.name} label={param.label} name={param.name}>
              <InputNumber
                min={param.min}
                max={param.max}
                step={param.step || 1}
                placeholder={param.placeholder}
                style={{ width: "100%" }}
              />
            </Form.Item>
          );
        case "select":
          return (
            <Form.Item key={param.name} label={param.label} name={param.name}>
              <Select placeholder={param.placeholder} options={param.options} />
            </Form.Item>
          );
        case "text":
          return (
            <Form.Item key={param.name} label={param.label} name={param.name}>
              <Input placeholder={param.placeholder} />
            </Form.Item>
          );
        case "switch":
          return (
            <Form.Item
              key={param.name}
              label={param.label}
              name={param.name}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          );
        default:
          return null;
      }
    });
  };

  // 模拟处理进度
  const handleProcess = () => {
    setProcessing(true);
    setProgress(0);
    setResult(null);
    let percent = 0;
    const timer = setInterval(() => {
      percent += Math.random() * 20;
      if (percent >= 100) {
        percent = 100;
        clearInterval(timer);
        setProcessing(false);
        setResult("处理完成，结果文件下载链接/预览（占位）");
      }
      setProgress(percent);
    }, 500);
  };

  return (
    <Card className="ffmpeg-panel" title="FFmpeg 操作与配置">
      <Form layout="vertical" form={form}>
        <Form.Item label="操作类型" name="operation">
          <Select
            value={operation}
            onChange={(value) => {
              setOperation(value);
              form.resetFields();
            }}
            options={OPERATION_OPTIONS}
            style={{ width: "100%" }}
          />
        </Form.Item>
        {renderParams()}
        <Divider />
        <Form.Item>
          <Button type="primary" onClick={handleProcess} loading={processing}>
            {processing ? "处理中..." : "开始处理"}
          </Button>
        </Form.Item>
      </Form>
      <Divider />
      {processing && (
        <Progress
          percent={Math.round(progress)}
          status={progress < 100 ? "active" : "success"}
        />
      )}
      {result && (
        <Alert
          message={result}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
      {!processing && !result && (
        <Alert
          message="处理进度与结果将在此展示（UI占位）"
          type="info"
          showIcon
        />
      )}
    </Card>
  );
};

export default FFmpegPanel;
