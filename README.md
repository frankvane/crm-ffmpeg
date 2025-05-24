# FFmpeg 转换模块接口说明

本文档旨在为后端开发人员提供 FFmpeg 转换模块接口所需的参数和操作说明。

前端在调用 FFmpeg 转换接口时，会提交一个 JSON 格式的数据载荷，其结构如下：

```json
{
  "file": {
    "file_id": "[后端返回的文件唯一ID]",
    "name": "[文件名]"
    // ... 其他可能需要的文件信息
  },
  "operations": ["operation1", "operation2", ...], // 选中的操作类型列表
  "params": { // 各操作的参数值
    "operation1": { "param1": value1, "param2": value2, ... },
    "operation2": { "param3": value3, ... }
    // ... 其他操作的参数
  }
}
```

## Operation (操作类型) 说明

`operations` 字段是一个字符串数组，包含用户选择的 FFmpeg 操作类型。后端需要根据这些操作类型执行相应的 FFmpeg 命令。可能的操作类型包括：

- `scale`: 视频缩放
- `compress`: 视频压缩
- `extract-audio`: 转出音频
- `crop`: 裁剪
- `clip-segment`: 截取片段
- `watermark`: 加水印
- `convert`: 格式转换
- `framerate`: 帧率调整
- `volume`: 音量调整
- `gif`: 视频转 GIF
- `cover`: 提取封面

## Params (参数) 说明

`params` 字段是一个嵌套的 JSON 对象，其键是操作类型，值是该操作对应的参数对象。参数对象的键是参数名称，值是参数的值。以下是每个操作可能包含的参数：

### `scale` (视频缩放)

- `width`: 目标宽度 (number, >= 1)
- `height`: 目标高度 (number, >= 1)

### `compress` (视频压缩)

- `bitrate`: 目标码率(kbps) (number, >= 100)

### `extract-audio` (转出音频)

- `audioFormat`: 音频格式 (string, 可选值: "mp3", "aac", "wav")

### `crop` (裁剪)

- `x`: 起始 X (number, >= 0)
- `y`: 起始 Y (number, >= 0)
- `width`: 宽度 (number, >= 1)
- `height`: 高度 (number, >= 1)

### `clip-segment` (截取片段)

- `start`: 起始时间(秒) (number, >= 0)
- `duration`: 持续时长(秒) (number, >= 1)

### `watermark` (加水印)

- `watermarkText`: 水印文字 (string)
- `fontSize`: 字体大小 (number, >= 10)
- `opacity`: 透明度(0-1) (number, >= 0, <= 1, 步长 0.1)

### `convert` (格式转换)

- `format`: 目标格式 (string, 可选值: "mp4", "avi", "mov", "mkv", "flv")

### `framerate` (帧率调整)

- `fps`: 目标帧率 (number, >= 1, <= 120)

### `volume` (音量调整)

- `volume`: 音量倍数 (number, >= 0, <= 10, 步长 0.1)

### `gif` (视频转 GIF)

- `start`: 起始时间(秒) (number, >= 0)
- `duration`: 持续时长(秒) (number, >= 1)

### `cover` (提取封面)

- `time`: 时间点(秒) (number, >= 0)

请后端开发人员根据上述操作类型和参数说明，实现相应的 FFmpeg 命令生成逻辑。
