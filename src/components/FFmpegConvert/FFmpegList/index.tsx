import { List, Radio, Space, Typography } from "antd";
import React, { useEffect } from "react";

import { FFmpegTemplate } from "../FFmpegPanel/types";
import styles from "./style.module.less";
import { useFFmpegPanelStore } from "../store"; // 更新导入路径

// import { useFFmpegListStore } from "./store"; // 移除对FFmpegList store的引入

const { Text } = Typography;

interface FFmpegListProps {
  templates?: FFmpegTemplate[];
}

const FFmpegList: React.FC<FFmpegListProps> = ({ templates }) => {
  const store = useFFmpegPanelStore();
  const { selectedTemplateId, selectTemplate } = store;
  const tplList = templates || store.templates;

  useEffect(() => {
    // 预留加载逻辑
  }, []);

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
      <List
        dataSource={tplList}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          locale: {
            items_per_page: "条/页",
            jump_to: "跳至",
            jump_to_confirm: "确定",
            next_page: "下一页",
            prev_page: "上一页",
            prev_5: "向前 5 页",
            next_5: "向后 5 页",
            prev_3: "向前 3 页",
            next_3: "向后 3 页",
          },
        }}
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
