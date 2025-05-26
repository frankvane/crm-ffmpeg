import { FFmpegOperationType, FFmpegTemplate } from "./FFmpegPanel/types";
import { PersistStorage, persist } from "zustand/middleware";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer"; // 导入 immer 中间件

interface FFmpegPanelState {
  selectedOperations: FFmpegOperationType[];
  paramValues: Record<string, Record<string, any>>; // 暂时使用 any
  templates: FFmpegTemplate[];
  selectedTemplateId: string | null; // 新增状态
  hasParamConflicts: boolean; // 新增冲突状态
  mode: "new" | "edit"; // 新增模式状态
  editingTemplateId: string | null; // 新增编辑模板ID
  // 可以根据需要添加其他状态，如处理进度等
}

// 定义一个用于 saveTemplate 参数的类型，id 是可选的
interface SavableFFmpegTemplate
  extends Omit<FFmpegTemplate, "id" | "createdAt" | "updatedAt"> {
  id?: string; // 使 id 成为可选属性
}

interface FFmpegPanelActions {
  setSelectedOperations: (operations: FFmpegOperationType[]) => void;
  setParamValues: (paramValues: Record<string, Record<string, any>>) => void;
  // 使用新定义的 SavableFFmpegTemplate 类型作为参数
  saveTemplate: (template: SavableFFmpegTemplate) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (id: string) => void;
  selectTemplate: (id: string | null) => void; // 新增 action
  setHasParamConflicts: (hasConflicts: boolean) => void; // 新增设置冲突状态 action
  setMode: (mode: "new" | "edit") => void;
  setEditingTemplateId: (id: string | null) => void;
}

// 实现 PersistStorage 接口的 customStorage 对象
const customStorage: PersistStorage<FFmpegPanelState & FFmpegPanelActions> = {
  getItem: (name) => {
    const item = localStorage.getItem(name);
    if (item) {
      // 需要手动解析 JSON
      return JSON.parse(item);
    }
    return null;
  },
  setItem: (name, value) => {
    // 需要手动 stringify JSON
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

// 使用 persist 和 immer 中间件包裹 create
export const useFFmpegPanelStore = create<
  FFmpegPanelState & FFmpegPanelActions
>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      selectedOperations: [],
      paramValues: {},
      templates: [], // 初始模板列表为空
      selectedTemplateId: null, // 初始 selectedTemplateId 为 null
      hasParamConflicts: false, // 初始无冲突
      mode: "new", // 初始模式为 'new'
      editingTemplateId: null, // 初始编辑模板ID为 null

      // Actions
      // 修改 set 的用法，直接修改 draft state
      setSelectedOperations: (operations) =>
        set((state) => {
          state.selectedOperations = operations;
        }),
      setParamValues: (paramValues) =>
        set((state) => {
          state.paramValues = paramValues;
        }),
      saveTemplate: (template) => {
        set((state) => {
          // 使用 immer 后直接修改 state
          const existingIndex = state.templates.findIndex(
            (tpl) => tpl.id === template.id
          ); // 查找是否存在同ID模板

          if (existingIndex > -1 && template.id !== undefined) {
            // 如果存在且有ID，执行更新
            state.templates[existingIndex] = {
              // 直接替换，更新时间和ID保持不变
              ...(template as FFmpegTemplate), // Cast to FFmpegTemplate to include id
              updatedAt: Date.now(),
            };
          } else {
            // 否则新增
            const newTemplate = {
              ...template,
              id: Date.now().toString(), // 简单的唯一ID生成
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            state.templates.push(newTemplate as FFmpegTemplate); // Cast to FFmpegTemplate
          }
        });
      },
      deleteTemplate: (id) => {
        set((state) => {
          // 使用 immer 后直接修改 state
          state.templates = state.templates.filter((tpl) => tpl.id !== id);
          // 这里不再需要同步其他状态
        });
      },
      applyTemplate: (id) => {
        const templateToApply = get().templates.find((tpl) => tpl.id === id);
        if (templateToApply) {
          set((state) => {
            // 使用 immer 后直接修改 state
            state.selectedOperations = templateToApply.operations;
            state.paramValues = templateToApply.params;
          });
          // TODO: 可能需要同步表单字段
        }
      },
      selectTemplate: (id) => {
        set((state) => {
          state.selectedTemplateId = id;
        });
      },
      setHasParamConflicts: (hasConflicts) => {
        set((state) => {
          state.hasParamConflicts = hasConflicts;
        });
      },
      setMode: (mode) => {
        set((state: any) => {
          state.mode = mode;
        });
      },
      setEditingTemplateId: (id) => {
        set((state: any) => {
          state.editingTemplateId = id;
        });
      },
    })), // immer 中间件结束
    {
      name: "ffmpeg-templates", // localStorage key
      storage: customStorage, // 使用 customStorage 对象
      // partialize 保持不变，因为它定义了哪些状态被持久化
      partialize: (state) =>
        ({
          templates: state.templates,
          selectedTemplateId: state.selectedTemplateId, // 持久化选中模板ID
        } as FFmpegPanelState & FFmpegPanelActions),
    }
  )
);
