import { Alert, Button, Input, List, Modal, Popconfirm, Space } from "antd";

import { FFmpegTemplate } from "./types";
import React from "react";

interface TemplateManagementModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  templates: FFmpegTemplate[];
  editingTemplateId: string | null;
  newTplName: string;
  setNewTplName: (name: string) => void;
  handleCreateTemplate: () => void;
  handleUpdateTemplate: () => void;
  handleOpenRenameModal: (tpl: { id: string; name: string }) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (id: string) => void;
  isSaveDisabled: boolean; // 新增 prop，用于控制新建/更新按钮的disabled状态
}

const TemplateManagementModal: React.FC<TemplateManagementModalProps> = ({
  modalOpen,
  setModalOpen,
  templates,
  editingTemplateId,
  newTplName,
  setNewTplName,
  handleCreateTemplate,
  handleUpdateTemplate,
  handleOpenRenameModal,
  deleteTemplate,
  applyTemplate,
  isSaveDisabled,
}) => {
  return (
    <Modal
      title="模板管理"
      open={modalOpen}
      onCancel={() => {
        setModalOpen(false);
        // 模态框关闭时，如果不在编辑模式，清空编辑模板ID
        if (!editingTemplateId) {
          // setEditingTemplateId(null); // 这个状态的管理现在由 useTemplateManagement 负责
        } else {
          // 如果在编辑模式下关闭模态框，用户可能取消了更新，问询用户是否保留编辑状态或放弃
          // 为了简化，暂时不处理，用户下次打开模态框时，editingTemplateId 依然存在
        }
      }}
      footer={null}
    >
      <div style={{ marginBottom: 16 }}>
        {/* 如果在编辑模式，显示更新提示和按钮 */}
        {editingTemplateId ? (
          <Alert
            message={`正在编辑模板：${
              templates.find((tpl) => tpl.id === editingTemplateId)?.name ||
              "未知模板"
            }`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          // 如果不在编辑模式，显示新建输入框和按钮
          <Space>
            <Input
              placeholder="新模板名称"
              value={newTplName}
              onChange={(e) => setNewTplName(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleCreateTemplate}
            />
            <Button
              type="primary"
              onClick={handleCreateTemplate}
              disabled={isSaveDisabled} // 使用传入的 prop
            >
              新建模板
            </Button>
          </Space>
        )}
        {/* 无论是否在编辑模式，如果当前有选中操作，都可以选择更新当前正在编辑的模板 */}
        {/* 注意：这里简化处理，即使editingTemplateId为空，也可以显示更新按钮，点击后提示用户需要先选择一个模板编辑 */}
        {editingTemplateId && ( // 只在编辑模式下显示更新按钮
          <Button
            type="primary"
            onClick={handleUpdateTemplate}
            style={{ marginLeft: 8 }}
            disabled={isSaveDisabled} // 使用传入的 prop
          >
            更新模板
          </Button>
        )}
      </div>
      <List
        bordered
        dataSource={templates}
        renderItem={(tpl) => (
          <List.Item
            actions={[
              // 应用模板按钮
              <Button
                key="apply"
                size="small"
                type="link"
                onClick={() => {
                  applyTemplate(tpl.id);
                  setModalOpen(false); // Close modal after applying
                  // setEditingTemplateId(null); // 这个状态的管理现在由 useTemplateManagement 负责
                }}
              >
                应用
              </Button>,
              // 编辑按钮
              <Button
                key="edit"
                size="small"
                type="link"
                onClick={() => {
                  applyTemplate(tpl.id); // 应用模板内容到主面板
                  // setEditingTemplateId(tpl.id); // 这个状态的管理现在由 useTemplateManagement 负责
                  setModalOpen(false); // 关闭模态框
                }}
              >
                编辑
              </Button>,
              // 重命名操作 - 改为打开模态框
              <Button
                key={`rename-${tpl.id}`}
                size="small"
                onClick={() => handleOpenRenameModal(tpl)} // 点击打开重命名模态框
              >
                重命名
              </Button>,
              // 删除操作
              <Popconfirm
                key={`delete-${tpl.id}`}
                title="确定删除该模板？"
                onConfirm={() => deleteTemplate(tpl.id)}
              >
                <Button size="small" danger>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tpl.name}
            </div>
          </List.Item>
        )}
        locale={{ emptyText: "暂无模板" }}
      />
    </Modal>
  );
};

export default TemplateManagementModal;
