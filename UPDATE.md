## 2025-05-24 12:43:34 (UTC)

**代码重构:**

- 将参数名冲突检测逻辑 (`getParamNameConflicts`) 抽离到 `src/components/FFmpegPanel/utils.ts` 工具文件中。
- 将参数表单项的渲染逻辑 (`renderParamItems`) 抽离到 `src/components/FFmpegPanel/OperationParametersFormItems.tsx` 组件中。
- 将模板管理相关的状态和逻辑抽离到 `src/components/FFmpegPanel/hooks/useTemplateManagement.ts` 自定义 hook 中。
- 将模板管理模态框 (`Modal` for `modalOpen`) 的 JSX 抽离到 `src/components/FFmpegPanel/TemplateManagementModal.tsx` 组件中。
- 将重命名模板模态框 (`Modal` for `renameModalOpen`) 的 JSX 抽离到 `src/components/FFmpegPanel/RenameTemplateModal.tsx` 组件中。
- 更新 `src/components/FFmpegPanel/index.tsx` 文件，使用抽离后的 hook 和组件，并移除相关的状态、逻辑和 JSX。
