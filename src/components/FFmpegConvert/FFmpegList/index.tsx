import { List, Radio, Space, Typography } from "antd";
import React, { useEffect } from "react";

import styles from "./style.module.less";
import { useFFmpegPanelStore } from "../store"; // 更新导入路径

// import { useFFmpegListStore } from "./store"; // 移除对FFmpegList store的引入

const { Text } = Typography;

const FFmpegList: React.FC = () => {
  const { templates, selectedTemplateId, selectTemplate } =
    // useFFmpegListStore(); // 使用FFmpegPanel store
    useFFmpegPanelStore();

  useEffect(() => {
    // Load templates when the component mounts
    // 注意：useFFmpegPanelStore中没有loadTemplates方法，需要调整或手动加载
    // 暂时不调用loadTemplates，假设App.tsx或其他地方已经加载了模板
    // loadTemplates(); // 移除loadTemplates调用，因为FFmpegPanel store中没有这个action
    // 如果FFmpegPanelStore需要加载模板，可以在这里触发，但这取决于您的设计
    // 例如：getTemplates(); // 假设FFmpegPanelStore有一个getTemplates action
  }, []); // 依赖项列表清空，避免无限循环

  const handleSelectTemplate = (templateId: string | null) => {
    selectTemplate(templateId);
    // TODO: Potentially update FFmpegPanel's state with selected template's operations and parameters
    // This would involve either:
    // 1. FFmpegList calling an action/function provided by FFmpegPanel or a shared store
    // 2. App.tsx observing selectedTemplateId changes and updating FFmpegPanel's store
    // 现在已经使用同一个store，可以直接在selectTemplate action中更新operation和params
  };

  // TODO: 在FFmpegPanel store中添加selectedTemplateId和selectTemplate action

  return (
    <div className={styles.ffmpegListContainer}>
      <h2>FFmpeg 模板列表 (单选)</h2>
      <List
        dataSource={templates}
        renderItem={(template) => (
          <List.Item
            actions={[
              <Radio
                checked={selectedTemplateId === template.id}
                onClick={() =>
                  handleSelectTemplate(
                    selectedTemplateId === template.id ? null : template.id
                  )
                }
              />,
            ]}
            className={styles.listItem}
          >
            <List.Item.Meta
              title={<Text strong>{template.name}</Text>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    操作: {template.operations.join(", ")}
                  </Text>
                  {/* Display some parameter summary if needed */}
                  {/* <Text type="secondary">参数: ...</Text> */}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default FFmpegList;
