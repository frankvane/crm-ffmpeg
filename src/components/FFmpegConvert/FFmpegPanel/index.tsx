import "./styles/style.less";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
} from "antd";
import { FFmpegOperationType, ParamValues } from "./types";
import React, { useEffect, useState } from "react";

import { OPERATION_SCHEMAS } from "./schemas";
import OperationParametersFormItems from "./components/OperationParametersFormItems";
import RenameTemplateModal from "./components/RenameTemplateModal";
import TemplateManagementModal from "./components/TemplateManagementModal";
import { getParamNameConflicts } from "./utils";
import { message } from "antd";
import { useFFmpegPanelStore } from "../store";
import useTemplateManagement from "./hooks/useTemplateManagement";

const FFmpegPanel: React.FC = () => {
  const [form] = Form.useForm();
  const {
    selectedOperations,
    paramValues,
    setSelectedOperations,
    setParamValues,
    setHasParamConflicts,
  } = useFFmpegPanelStore();

  // 新增：模式状态 new/edit
  const [mode, setMode] = useState<"new" | "edit">("new");
  // 新建模板弹窗状态
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTplName, setNewTplName] = useState("");

  // 使用抽离的模板管理hook
  const {
    modalOpen,
    setModalOpen,
    editingTemplateId,
    setEditingTemplateId,
    renameModalOpen,
    renamingTemplate,
    newTemplateName,
    setNewTemplateName,
    templates,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleOpenRenameModal,
    handleRenameCancel,
    handleRenameSave,
    deleteTemplate,
    applyTemplate,
    selectTemplate,
  } = useTemplateManagement({ form, selectedOperations, paramValues });

  // 定义操作类型分组和对应的Antd Checkbox options
  const videoProcessOps: FFmpegOperationType[] = [
    "scale",
    "compress",
    "crop",
    "clip-segment",
    "watermark",
    "framerate",
    "gif",
    "cover",
  ];
  const formatConvertOp: FFmpegOperationType = "convert";
  const audioOps: FFmpegOperationType[] = ["extract-audio", "volume"];

  // 根据当前选择的操作，计算哪些其他操作会导致冲突或与格式转换互斥
  const getDisabledOperations = () => {
    const disabledOps: FFmpegOperationType[] = [];

    // 只做参数名冲突检测，不再做格式转换与其它操作的互斥
    const allOps = [...videoProcessOps, formatConvertOp, ...audioOps];
    allOps.forEach((op) => {
      // 检查将当前操作添加到已选操作中是否会引起冲突
      const otherSelectedOps = selectedOperations.filter((item) => item !== op);
      const potentialOps = [...otherSelectedOps, op];
      const conflicts = getParamNameConflicts(potentialOps);
      if (conflicts.length > 0) {
        // Check if the current op是冲突的一部分
        const opParams = OPERATION_SCHEMAS[op]?.params || [];
        const opParamNames = new Set(opParams.map((p) => p.name));
        for (const [paramName, conflictOps] of conflicts) {
          if (
            opParamNames.has(paramName) &&
            conflictOps.some((label) =>
              otherSelectedOps
                .map((otherOp) => OPERATION_SCHEMAS[otherOp].label)
                .includes(label)
            ) &&
            conflictOps.includes(OPERATION_SCHEMAS[op].label)
          ) {
            disabledOps.push(op);
            break;
          }
        }
      }
    });
    return disabledOps;
  };

  const disabledOperations = getDisabledOperations();

  const videoProcessOptions = videoProcessOps.map((op) => ({
    label: OPERATION_SCHEMAS[op].label,
    value: op,
    disabled: disabledOperations.includes(op),
  }));
  const formatConvertOption = {
    label: OPERATION_SCHEMAS[formatConvertOp].label,
    value: formatConvertOp,
    disabled: disabledOperations.includes(formatConvertOp),
  };
  const audioOptions = audioOps.map((op) => ({
    label: OPERATION_SCHEMAS[op].label,
    value: op,
    disabled: disabledOperations.includes(op),
  }));

  // 视觉顺序：视频处理、格式转换、音频
  const getVisualSelectedOperations = () => {
    const video = videoProcessOps.filter((v) => selectedOperations.includes(v));
    const format = selectedOperations.includes(formatConvertOp)
      ? [formatConvertOp]
      : [];
    const audio = audioOps.filter((a) => selectedOperations.includes(a));
    return [...video, ...format, ...audio];
  };

  // 推荐操作顺序
  const operationOrder = [
    "clip-segment",
    "scale",
    "compress",
    "crop",
    "watermark",
    "framerate",
    "gif",
    "cover",
    "extract-audio",
    "volume",
    "convert",
  ];

  // 处理操作类型多选 (包含参数名冲突检测)
  const handleOperationChange = (ops: Array<FFmpegOperationType>) => {
    // 自动排序：clip-segment最前，convert最后，其它按推荐顺序
    const newOps = [...ops].sort(
      (a, b) => operationOrder.indexOf(a) - operationOrder.indexOf(b)
    );
    // 参数名冲突检测
    const conflicts = getParamNameConflicts(newOps);
    setHasParamConflicts(conflicts.length > 0);
    if (conflicts.length > 0) {
      // 这里只显示冲突信息，但不阻止选择，让用户自行决定
      console.warn("参数名冲突:", conflicts);
    }
    setSelectedOperations(newOps);
    // **新增逻辑：根据新的选中操作和当前值，计算并应用默认值**
    const updatedParamValues: ParamValues = { ...paramValues };
    newOps.forEach((op) => {
      if (!updatedParamValues[op]) {
        updatedParamValues[op] = {};
      }
      const params = OPERATION_SCHEMAS[op]?.params || [];
      params.forEach((param) => {
        if (
          updatedParamValues[op][param.name] === undefined &&
          param.defaultValue !== undefined
        ) {
          updatedParamValues[op][param.name] = param.defaultValue;
        }
      });
    });
    setParamValues(updatedParamValues);
    form.setFieldsValue(updatedParamValues);
  };

  // 处理参数表单变更
  const handleValuesChange = (_changed: ParamValues, all: ParamValues) => {
    setParamValues(all);
  };

  // 表单初始值同步和默认值设置
  useEffect(() => {
    // 组件加载时，如果paramValues为空，根据初始选中的操作设置默认值
    if (
      Object.keys(paramValues).length === 0 &&
      selectedOperations.length > 0
    ) {
      const initialParamValues: ParamValues = {};
      selectedOperations.forEach((op) => {
        initialParamValues[op] = {};
        const params = OPERATION_SCHEMAS[op]?.params || [];
        params.forEach((param) => {
          if (param.defaultValue !== undefined) {
            initialParamValues[op][param.name] = param.defaultValue;
          }
        });
      });
      setParamValues(initialParamValues);
    } else {
      form.setFieldsValue(paramValues);
    }
  }, [paramValues, form, selectedOperations, setParamValues]);

  const visualSelectedOperations = getVisualSelectedOperations();
  const paramNameConflicts = getParamNameConflicts(visualSelectedOperations);

  // 新建模板弹窗确认
  const handleCreateTemplateAndReset = async () => {
    try {
      await form.validateFields();
      if (!newTplName.trim()) {
        message.warning("请输入模板名称");
        return;
      }
      // 保存模板，直接传递输入框的值
      await handleCreateTemplate(newTplName.trim());
      setCreateModalOpen(false);
      setSelectedOperations([]);
      setParamValues({});
      setMode("new");
      form.resetFields();
      message.success("模板已保存");
    } catch {
      message.error("请先正确填写所有参数！");
    }
  };

  // 确认修改后，清空参数并切回new模式
  const handleConfirmEdit = async () => {
    try {
      await form.validateFields();
      await handleUpdateTemplate();
      setSelectedOperations([]);
      setParamValues({});
      setMode("new");
      setEditingTemplateId(null);
      form.resetFields();
      message.success("模板已更新");
    } catch {
      message.error("请先正确填写所有参数！");
    }
  };

  return (
    <Card className="ffmpeg-panel" title="FFmpeg 操作与配置">
      {/* 模式提示 */}
      <Alert
        message={
          mode === "edit"
            ? '编辑模式：请修改参数后点击"确认修改"'
            : '新建模式：请填写参数后点击"新建模板"'
        }
        type={mode === "edit" ? "info" : "success"}
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16 }}>
        <Row gutter={32} align="top">
          <Col span={12}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>视频操作</div>
            <Checkbox.Group
              options={videoProcessOptions}
              value={selectedOperations}
              onChange={handleOperationChange}
              style={{ display: "flex", flexDirection: "column" }}
            />
            <Divider style={{ margin: "16px 0 8px 0" }} />
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>格式转换</div>
            <Checkbox
              checked={selectedOperations.includes(formatConvertOp)}
              onChange={(e) => {
                if (e.target.checked) {
                  handleOperationChange([
                    ...selectedOperations,
                    formatConvertOp,
                  ]);
                } else {
                  handleOperationChange(
                    selectedOperations.filter((op) => op !== formatConvertOp)
                  );
                }
              }}
              disabled={disabledOperations.includes(formatConvertOp)}
            >
              {formatConvertOption.label}
            </Checkbox>
          </Col>
          <Col span={12}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>音频操作</div>
            <Checkbox.Group
              options={audioOptions}
              value={selectedOperations}
              onChange={handleOperationChange}
              style={{ display: "flex", flexDirection: "column" }}
            />
          </Col>
        </Row>
        {/* 新建模板和模板管理按钮分离 */}
        <Space style={{ marginTop: 8 }}>
          <Button
            type="primary"
            onClick={() => {
              setCreateModalOpen(true);
              setNewTplName("");
            }}
            disabled={selectedOperations.length === 0}
          >
            新建模板
          </Button>
          <Button onClick={() => setModalOpen(true)} type="default">
            模板管理
          </Button>
        </Space>
      </div>
      <Form
        layout="vertical"
        form={form}
        initialValues={paramValues}
        onValuesChange={handleValuesChange}
      >
        {/* 使用抽离的参数表单项组件 */}
        <OperationParametersFormItems
          visualSelectedOperations={visualSelectedOperations}
        />
        <Divider />
        {/* 参数名冲突提示 */}
        {paramNameConflicts.length > 0 && (
          <Alert
            message={
              <span>
                存在参数名冲突：
                {paramNameConflicts.map(([name, arr]) => (
                  <span key={name} style={{ marginLeft: 8 }}>
                    <b>{name}</b>（{arr.join("、")}）
                  </span>
                ))}
                ，请注意参数不会互相覆盖。
              </span>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {/* 确认修改按钮，仅在edit模式下显示 */}
        {mode === "edit" && (
          <Button
            type="primary"
            style={{ marginTop: 16, width: "100%" }}
            onClick={handleConfirmEdit}
          >
            保存设置
          </Button>
        )}
      </Form>
      {/* 新建模板弹窗 */}
      <Modal
        title="新建模板"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          setNewTplName("");
        }}
        onOk={handleCreateTemplateAndReset}
        okText="保存"
        cancelText="取消"
      >
        <Input
          placeholder="请输入模板名称"
          value={newTplName}
          onChange={(e) => setNewTplName(e.target.value)}
          onPressEnter={handleCreateTemplateAndReset}
        />
      </Modal>
      {/* 使用抽离的模板管理模态框组件 */}
      <TemplateManagementModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        templates={templates}
        editingTemplateId={editingTemplateId}
        handleUpdateTemplate={handleUpdateTemplate}
        handleOpenRenameModal={handleOpenRenameModal}
        deleteTemplate={deleteTemplate}
        applyTemplate={(tplId) => {
          applyTemplate(tplId);
          selectTemplate(tplId);
          setModalOpen(false);
        }}
        selectTemplate={selectTemplate}
        setEditingTemplateId={setEditingTemplateId}
        setMode={setMode}
        isSaveDisabled={selectedOperations.length === 0}
      />
      {/* 使用抽离的重命名模板模态框组件 */}
      <RenameTemplateModal
        renameModalOpen={renameModalOpen}
        handleRenameCancel={handleRenameCancel}
        handleRenameSave={handleRenameSave}
        renamingTemplate={renamingTemplate}
        newTemplateName={newTemplateName}
        setNewTemplateName={setNewTemplateName}
      />
    </Card>
  );
};

export default FFmpegPanel;
