import { Alert, Button, List, Modal, Popconfirm } from "antd";

import { FFmpegTemplate } from "../types";
import React from "react";

interface TemplateManagementModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  templates: FFmpegTemplate[];
  editingTemplateId: string | null;
  handleUpdateTemplate: () => void;
  handleOpenRenameModal: (tpl: { id: string; name: string }) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (id: string) => void;
  selectTemplate: (id: string) => void;
  setEditingTemplateId: (id: string | null) => void;
  setMode: (mode: "new" | "edit") => void;
  isSaveDisabled: boolean;
}

const TemplateManagementModal: React.FC<TemplateManagementModalProps> = ({
  modalOpen,
  setModalOpen,
  templates,
  editingTemplateId,
  handleUpdateTemplate,
  handleOpenRenameModal,
  deleteTemplate,
  applyTemplate,
  selectTemplate,
  setEditingTemplateId,
  setMode,
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
        ) : null}
        {/* 只在编辑模式下显示更新按钮 */}
        {editingTemplateId && (
          <Button
            type="primary"
            onClick={handleUpdateTemplate}
            style={{ marginLeft: 8 }}
            disabled={isSaveDisabled}
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
              // 编辑按钮
              <Button
                key="edit"
                size="small"
                type="link"
                onClick={() => {
                  applyTemplate(tpl.id);
                  selectTemplate(tpl.id);
                  setEditingTemplateId(tpl.id); // 进入编辑模式
                  setMode("edit");
                  setModalOpen(false);
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
