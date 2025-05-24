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

// 检查将某个操作添加到当前已选操作中是否会引起参数命名冲突
export function doesAddingOperationCauseConflict(
  currentSelectedOperations: FFmpegOperationType[],
  operationToAdd: FFmpegOperationType
): boolean {
  const currentParamNames = new Set<string>();
  // 收集当前已选操作的所有参数名
  currentSelectedOperations.forEach((op) => {
    (OPERATION_SCHEMAS[op]?.params || []).forEach((param) => {
      currentParamNames.add(param.name);
    });
  });

  // 检查待添加操作的参数名是否与当前已选操作的参数名冲突
  const paramsOfOperationToAdd =
    OPERATION_SCHEMAS[operationToAdd]?.params || [];
  for (const param of paramsOfOperationToAdd) {
    if (currentParamNames.has(param.name)) {
      return true; // 存在冲突
    }
  }

  return false; // 无冲突
}
