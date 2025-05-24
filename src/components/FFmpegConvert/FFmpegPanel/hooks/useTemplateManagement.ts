import { FFmpegOperationType, ParamValues } from "../types";

import { FormInstance } from "antd/lib/form";
import { message } from "antd";
import { useFFmpegPanelStore } from "../../store";
import { useState } from "react";

interface UseTemplateManagementProps {
  form: FormInstance; // 需要访问form实例来校验参数
  selectedOperations: FFmpegOperationType[];
  paramValues: ParamValues;
}

const useTemplateManagement = ({
  form,
  selectedOperations,
  paramValues,
}: UseTemplateManagementProps) => {
  // 模板管理弹窗状态和重命名状态
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [newTplName, setNewTplName] = useState(""); // 用于新建模板输入框

  // 重命名模态框状态
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingTemplate, setRenamingTemplate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newTemplateName, setNewTemplateName] = useState(""); // 用于重命名输入框

  const { templates, saveTemplate, deleteTemplate, applyTemplate } =
    useFFmpegPanelStore();

  // 新建模板 (包含表单验证)
  const handleCreateTemplate = async () => {
    try {
      await form.validateFields(); // 校验所有参数
    } catch {
      message.error("请先正确填写所有参数，再保存模板！");
      return;
    }
    if (!newTplName.trim()) {
      message.warning("请输入模板名称");
      return;
    }
    // 调用 saveTemplate 进行新增操作
    saveTemplate({
      name: newTplName.trim(),
      operations: selectedOperations,
      params: paramValues,
    });
    setNewTplName("");
    message.success("模板已保存");
    setEditingTemplateId(null); // 新增后退出编辑模式
  };

  // 更新当前正在编辑的模板
  const handleUpdateTemplate = async () => {
    if (!editingTemplateId) return; // 不在编辑模式则不执行

    try {
      await form.validateFields(); // 校验所有参数
    } catch {
      message.error("请先正确填写所有参数，再更新模板！");
      return;
    }

    // 找到当前编辑的模板，获取其创建时间
    const currentTemplate = templates.find(
      (tpl) => tpl.id === editingTemplateId
    );

    if (!currentTemplate) {
      message.error("未找到要更新的模板！");
      setEditingTemplateId(null);
      return;
    }

    // 调用 saveTemplate 进行更新操作 (包含原ID和创建时间)
    saveTemplate({
      id: editingTemplateId,
      name: currentTemplate.name,
      operations: selectedOperations,
      params: paramValues,
      createdAt: currentTemplate.createdAt,
    } as any); // 强制类型转换，因为 saveTemplate 参数类型是 SavableFFmpegTemplate

    message.success("模板已更新");
    setEditingTemplateId(null); // 更新后退出编辑模式
    setModalOpen(false); // 关闭模态框
  };

  // 模板保存 (触发模态框)
  const handleSaveTemplate = () => {
    setModalOpen(true);
    // 打开模态框时，如果不在编辑模式，清空新建模板名称输入框
    if (!editingTemplateId) {
      setNewTplName("");
    }
  };

  // 打开重命名模态框
  const handleOpenRenameModal = (tpl: { id: string; name: string }) => {
    setRenamingTemplate(tpl);
    setNewTemplateName(tpl.name); // 将当前名称填充到输入框
    setRenameModalOpen(true);
  };

  // 处理重命名保存
  const handleRenameSave = async () => {
    if (!renamingTemplate) return; // 没有正在重命名的模板

    if (!newTemplateName.trim()) {
      message.warning("请输入新的模板名称");
      return;
    }

    // 找到要重命名的模板并更新其名称
    const templateToRename = templates.find(
      (tpl) => tpl.id === renamingTemplate.id
    );

    if (templateToRename) {
      // 调用 saveTemplate 进行更新操作
      saveTemplate({
        ...templateToRename,
        name: newTemplateName.trim(),
      });
      message.success("模板已重命名");
      handleRenameCancel(); // 重命名成功后关闭模态框
    }
  };

  // 处理重命名取消
  const handleRenameCancel = () => {
    setRenameModalOpen(false);
    setRenamingTemplate(null);
    setNewTemplateName("");
  };

  return {
    modalOpen,
    setModalOpen,
    editingTemplateId,
    setEditingTemplateId,
    newTplName,
    setNewTplName,
    renameModalOpen,
    setRenameModalOpen,
    renamingTemplate,
    setRenamingTemplate,
    newTemplateName,
    setNewTemplateName,
    templates,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleSaveTemplate,
    handleOpenRenameModal,
    handleRenameSave,
    handleRenameCancel,
    deleteTemplate,
    applyTemplate,
  };
};

export default useTemplateManagement;
