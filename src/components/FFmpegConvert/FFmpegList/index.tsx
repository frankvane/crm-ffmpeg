import { List, Radio, Space, Typography } from "antd";

import { FFmpegTemplate } from "../FFmpegPanel/types";
import React from "react";
import styles from "./style.module.less";
import { useFFmpegPanelStore } from "../store"; // 更新导入路径

const { Text } = Typography;

interface FFmpegListProps {
  templates?: FFmpegTemplate[];
}

const FFmpegList: React.FC<FFmpegListProps> = ({ templates }) => {
  const store = useFFmpegPanelStore();
  const { selectedTemplateId, selectTemplate } = store;
  const tplList = templates || store.templates;
  const handleSelectTemplate = (templateId: string | null) => {
    selectTemplate(templateId);
  };

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
                className={styles.radioCustom}
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
