import "./style.less";

import { Alert, Button, Card, Checkbox, Col, Divider, Form, Row } from "antd";
import { FFmpegOperationType, ParamValues } from "./types";
import React, { useEffect } from "react";

import { OPERATION_SCHEMAS } from "./schemas";
import OperationParametersFormItems from "./OperationParametersFormItems";
import RenameTemplateModal from "./RenameTemplateModal";
import TemplateManagementModal from "./TemplateManagementModal";
import { getParamNameConflicts } from "./utils";
import { useFFmpegPanelStore } from "./store";
import useTemplateManagement from "./hooks/useTemplateManagement";

const FFmpegPanel: React.FC = () => {
  const [form] = Form.useForm();
  const {
    selectedOperations,
    paramValues,
    setSelectedOperations,
    setParamValues,
  } = useFFmpegPanelStore();

  // 使用抽离的模板管理hook
  const {
    modalOpen,
    setModalOpen,
    editingTemplateId,
    newTplName,
    setNewTplName,
    renameModalOpen,
    renamingTemplate,
    newTemplateName,
    setNewTemplateName,
    templates,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleSaveTemplate,
    handleOpenRenameModal,
    handleRenameCancel,
    handleRenameSave,
    deleteTemplate,
    applyTemplate,
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

  const videoProcessOptions = videoProcessOps.map((op) => ({
    label: OPERATION_SCHEMAS[op].label,
    value: op,
  }));
  const formatConvertOption = {
    label: OPERATION_SCHEMAS[formatConvertOp].label,
    value: formatConvertOp,
  };
  const audioOptions = audioOps.map((op) => ({
    label: OPERATION_SCHEMAS[op].label,
    value: op,
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

  // 处理操作类型多选 (包含互斥和参数名冲突检测)
  const handleOperationChange = (ops: Array<FFmpegOperationType>) => {
    let newOps = [...ops];

    // 格式转换互斥逻辑
    if (newOps.includes(formatConvertOp)) {
      newOps = [formatConvertOp, ...audioOps.filter((a) => newOps.includes(a))];
    } else {
      newOps = [
        ...videoProcessOps.filter((v) => newOps.includes(v)),
        ...audioOps.filter((a) => newOps.includes(a)),
      ];
    }

    // 参数名冲突检测 (保留)
    const conflicts = getParamNameConflicts(newOps);
    if (conflicts.length > 0) {
      // 这里只显示冲突信息，但不阻止选择，让用户自行决定
      console.warn("参数名冲突:", conflicts);
    }

    setSelectedOperations(newOps);

    // **新增逻辑：根据新的选中操作和当前值，计算并应用默认值**
    const updatedParamValues: ParamValues = { ...paramValues }; // 保留现有参数值
    newOps.forEach((op) => {
      if (!updatedParamValues[op]) {
        updatedParamValues[op] = {}; // 如果新操作没有对应的参数对象，则创建一个
      }
      const params = OPERATION_SCHEMAS[op]?.params || [];
      params.forEach((param) => {
        // 如果参数在当前paramValues中没有值，且schema中有默认值，则设置默认值
        if (
          updatedParamValues[op][param.name] === undefined &&
          param.defaultValue !== undefined
        ) {
          updatedParamValues[op][param.name] = param.defaultValue;
        }
      });
    });

    setParamValues(updatedParamValues);
    form.setFieldsValue(updatedParamValues); // 同步到表单
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

  return (
    <Card className="ffmpeg-panel" title="FFmpeg 操作与配置">
      <div style={{ marginBottom: 16 }}>
        <Row gutter={32} align="top">
          <Col span={12}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>视频操作</div>
            <Checkbox.Group
              options={videoProcessOptions}
              value={selectedOperations}
              onChange={handleOperationChange}
              style={{ display: "flex", flexDirection: "column" }}
              disabled={selectedOperations.includes(formatConvertOp)} // 选中格式转换后禁用视频处理
            />
            <Divider style={{ margin: "16px 0 8px 0" }} />
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>格式转换</div>
            <Checkbox
              checked={selectedOperations.includes(formatConvertOp)}
              onChange={(e) => {
                if (e.target.checked) {
                  // 格式转换互斥：只保留格式转换和音频操作
                  handleOperationChange([
                    formatConvertOp,
                    ...selectedOperations.filter((op) => audioOps.includes(op)),
                  ]);
                } else {
                  // 移除格式转换后，保留视频处理和音频操作
                  handleOperationChange(
                    selectedOperations.filter((op) => op !== formatConvertOp)
                  );
                }
              }}
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
        <Button
          type="primary"
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={handleSaveTemplate} // 使用hook中的函数
        >
          模板
        </Button>
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
      </Form>
      {/* 使用抽离的模板管理模态框组件 */}
      <TemplateManagementModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        templates={templates}
        editingTemplateId={editingTemplateId}
        newTplName={newTplName}
        setNewTplName={setNewTplName}
        handleCreateTemplate={handleCreateTemplate}
        handleUpdateTemplate={handleUpdateTemplate}
        handleOpenRenameModal={handleOpenRenameModal}
        deleteTemplate={deleteTemplate}
        applyTemplate={applyTemplate}
        isSaveDisabled={selectedOperations.length === 0} // 传递disabled状态
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
