import { Card, Input, Layout } from "antd";
import { FFmpegList, FFmpegPanel } from "../index";
import React, { useMemo, useState } from "react";

import { useFFmpegPanelStore } from "../store";

const { Sider, Content } = Layout;
const { Search } = Input;

const MainPanel: React.FC = () => {
  const { templates } = useFFmpegPanelStore();
  const [search, setSearch] = useState("");

  // 搜索过滤模板
  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return templates;
    return templates.filter((tpl) => tpl.name.includes(search.trim()));
  }, [templates, search]);

  return (
    <Layout style={{ minHeight: 600, background: "#e5e5e5", borderRadius: 8 }}>
      <Sider
        width={320}
        style={{
          background: "#e5e5e5",
          padding: 24,
          borderRight: "1px solid #eee",
        }}
      >
        <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
          模板列表
        </h2>
        <Search
          placeholder="搜索模板名称"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        {/* 传递过滤后的模板给FFmpegList */}
        <FFmpegList templates={filteredTemplates} />
      </Sider>
      <Content style={{ padding: 32 }}>
        <Card
          style={{ maxWidth: 600, margin: "0 auto", minHeight: 500 }}
          styles={{ body: { padding: 24 } }}
        >
          <FFmpegPanel />
        </Card>
      </Content>
    </Layout>
  );
};

export default MainPanel;
