// FFmpeg 操作类型、参数、模板等类型定义

export type FFmpegOperationType =
  | "scale"
  | "compress"
  | "extract-audio"
  | "crop"
  | "clip-segment"
  | "watermark"
  | "convert"
  | "framerate"
  | "volume"
  | "gif"
  | "cover";

export interface FFmpegParamSchema {
  name: string;
  label: string;
  type: "number" | "select" | "text" | "switch";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  defaultValue?: number | string | boolean;
}

export interface FFmpegOperationSchema {
  label: string;
  params: FFmpegParamSchema[];
}

export type FFmpegSchemaMap = Record<
  FFmpegOperationType,
  FFmpegOperationSchema
>;

// paramValues结构：{ [operation]: { [param]: value } }
export type ParamValues = Record<string, Record<string, any>>; // Export ParamValues, still using any for inner value

export interface FFmpegTemplate {
  id: string;
  name: string;
  operations: FFmpegOperationType[];
  params: Record<string, any>; // 各参数值 (still using any)
  createdAt: number;
  updatedAt: number;
}
