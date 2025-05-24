import {
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from "antd";
import { FFmpegOperationType, FFmpegParamSchema } from "../types";
import type { Rule, RuleObject } from "antd/es/form";

import { OPERATION_SCHEMAS } from "../schemas";
import React from "react";

interface OperationParametersFormItemsProps {
  visualSelectedOperations: FFmpegOperationType[];
}

const OperationParametersFormItems: React.FC<
  OperationParametersFormItemsProps
> = ({ visualSelectedOperations }) => {
  const operationItems: React.ReactNode[] = [];

  visualSelectedOperations.forEach((op) => {
    const params = OPERATION_SCHEMAS[op]?.params || [];
    if (params.length === 0) return;

    // 添加操作类型的小标题或分隔
    operationItems.push(
      <Divider
        key={`divider-${op}`}
        orientation="left"
        plain
        style={{ marginTop: 24, marginBottom: 16 }}
      >
        {OPERATION_SCHEMAS[op].label} 参数
      </Divider>
    );

    const paramRowItems: React.ReactNode[] = [];
    params.forEach((param: FFmpegParamSchema) => {
      const itemName = [op, param.name];
      const itemKey = `${op}_${param.name}`;

      // 动态生成rules
      const rules: Rule[] = [
        { required: true, message: `请输入${param.label}` },
      ];
      if (param.type === "number") {
        if (param.min !== undefined) {
          rules.push({
            validator: (
              _: RuleObject,
              value: number | string | boolean | undefined
            ) =>
              value === undefined || Number(value) >= param.min!
                ? Promise.resolve()
                : Promise.reject(
                    new Error(`${param.label}不能小于${param.min}`)
                  ),
          });
        }
        if (param.max !== undefined) {
          rules.push({
            validator: (
              _: RuleObject,
              value: number | string | boolean | undefined
            ) =>
              value === undefined || Number(value) <= param.max!
                ? Promise.resolve()
                : Promise.reject(
                    new Error(`${param.label}不能大于${param.max}`)
                  ),
          });
        }
      }

      let node: React.ReactNode = null;
      switch (param.type) {
        case "number":
          node = (
            <Form.Item
              key={itemKey}
              label={param.label}
              name={itemName}
              rules={rules}
              style={{ marginBottom: 16 }}
            >
              <InputNumber
                min={param.min}
                max={param.max}
                step={param.step || 1}
                placeholder={param.placeholder}
                style={{ width: "100%" }} // Make InputNumber take full width
              />
            </Form.Item>
          );
          break;
        case "select":
          node = (
            <Form.Item
              key={itemKey}
              label={param.label}
              name={itemName}
              rules={rules}
              style={{ marginBottom: 16 }}
            >
              <Select placeholder={param.placeholder} options={param.options} />
            </Form.Item>
          );
          break;
        case "text":
          node = (
            <Form.Item
              key={itemKey}
              label={param.label}
              name={itemName}
              rules={rules}
              style={{ marginBottom: 16 }}
            >
              <Input placeholder={param.placeholder} />
            </Form.Item>
          );
          break;
        case "switch":
          node = (
            <Form.Item
              key={itemKey}
              label={param.label}
              name={itemName}
              valuePropName="checked" // For Switch component
              rules={rules}
              style={{ marginBottom: 16 }}
            >
              <Switch />
            </Form.Item>
          );
          break;
        default:
          node = null;
      }
      if (node) paramRowItems.push(node);
    });

    // 将该操作的参数按2列分组
    for (let i = 0; i < paramRowItems.length; i += 2) {
      operationItems.push(
        <Row gutter={16} key={`op-${op}-row-${i / 2}`}>
          <Col span={12}>{paramRowItems[i]}</Col>
          {paramRowItems[i + 1] && <Col span={12}>{paramRowItems[i + 1]}</Col>}
        </Row>
      );
    }
  });

  return <>{operationItems}</>; // Return all generated rows
};

export default OperationParametersFormItems;
