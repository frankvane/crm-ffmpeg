import { FFmpegOperationType, FFmpegParamSchema } from "./types";

import { OPERATION_SCHEMAS } from "./schemas";

// 检查参数名冲突
export function getParamNameConflicts(
  visualSelectedOperations: FFmpegOperationType[]
) {
  const nameMap: Record<string, string[]> = {};
  visualSelectedOperations.forEach((op) => {
    (OPERATION_SCHEMAS[op]?.params || []).forEach(
      (param: FFmpegParamSchema) => {
        if (!nameMap[param.name]) nameMap[param.name] = [];
        nameMap[param.name].push(OPERATION_SCHEMAS[op].label);
      }
    );
  });
  return Object.entries(nameMap).filter(([, arr]) => arr.length > 1);
}
