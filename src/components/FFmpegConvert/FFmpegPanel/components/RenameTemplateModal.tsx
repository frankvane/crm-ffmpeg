import { Button, Input, Modal } from "antd";

import React from "react";

interface RenameTemplateModalProps {
  renameModalOpen: boolean;
  handleRenameCancel: () => void;
  handleRenameSave: () => void;
  renamingTemplate: { id: string; name: string } | null;
  newTemplateName: string;
  setNewTemplateName: (name: string) => void;
}

const RenameTemplateModal: React.FC<RenameTemplateModalProps> = ({
  renameModalOpen,
  handleRenameCancel,
  handleRenameSave,
  renamingTemplate,
  newTemplateName,
  setNewTemplateName,
}) => {
  return (
    <Modal
      title={`重命名模板：${renamingTemplate?.name || ""}`}
      open={renameModalOpen}
      onCancel={handleRenameCancel}
      footer={[
        <Button key="back" onClick={handleRenameCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleRenameSave}>
          保存
        </Button>,
      ]}
    >
      <Input
        placeholder="请输入新的模板名称"
        value={newTemplateName}
        onChange={(e) => setNewTemplateName(e.target.value)}
        onPressEnter={handleRenameSave}
      />
    </Modal>
  );
};

export default RenameTemplateModal;
