import { Button, Card, Space, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";

import FileUploader from "./components/FileUploader";
import { MainPanel } from "./components/FFmpegConvert";
import { useFFmpegPanelStore } from "./components/FFmpegConvert/store";
import { v4 as uuidv4 } from "uuid";

const { Text } = Typography;

function App() {
  // 存储上传的文件信息，使用联合类型 File & { file_id: string } | null
  const [uploadedFile, setUploadedFile] = useState<
    (File & { file_id: string }) | null
  >(null);
  const { templates, selectedTemplateId, hasParamConflicts } =
    useFFmpegPanelStore();
  const [progress, setProgress] = useState<number>(0); // 进度百分比
  const [progressStage, setProgressStage] = useState<string>(""); // 当前阶段
  const wsRef = useRef<WebSocket | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  // 合并处理文件上传成功和文件检查成功的逻辑
  const handleUploadSuccess = (file: File, res: any) => {
    // 假设后端返回的文件信息在 res.file 中，并且包含 file_id
    if (res && res.file && res.file.file_id) {
      // 将后端返回的file_id和文件name合并到uploadedFile状态中
      setUploadedFile({
        ...file, // 保留 File 对象的基本属性（如 name, size, type 等）
        name: file.name, // 显式获取文件名称
        file_id: res.file.file_id, // 后端返回的文件ID
      });
      message.success(`文件 ${file.name} 处理成功！`); // 统一提示处理成功
    } else {
      // 如果没有 file_id，显示错误并清空状态
      message.error(`文件 ${file.name} 处理成功，但未获取到文件ID！`);
      setUploadedFile(null);
    }
  };

  // 处理开始转换
  const handleStartConversion = async () => {
    if (!uploadedFile) {
      message.warning("请先上传文件！");
      return;
    }
    if (!selectedTemplateId) {
      message.warning("请选择FFmpeg模板！");
      return;
    }

    // 根据选中模板ID查找模板
    const selectedTemplate = templates.find(
      (template) => template.id === selectedTemplateId
    );

    // 如果没有找到选中的模板（不应该发生，但为了安全起见添加检查）
    if (!selectedTemplate) {
      message.error("未找到选中的FFmpeg模板信息！");
      return;
    }

    // 1. 生成 taskId
    const newTaskId = uuidv4();
    setTaskId(newTaskId);

    // 2. 建立 WebSocket 连接
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ taskId: newTaskId }));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "progress") {
        setProgress(data.progress); // 更新进度
        setProgressStage(data.stage || ""); // 更新阶段
      }
      // 可根据 data.type 处理其他类型消息
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      message.error("WebSocket 连接出错");
    };
    ws.onclose = () => {
      wsRef.current = null;
    };

    // 3. 构建发送给后端的数据载荷
    const conversionPayload = {
      taskId: newTaskId,
      file: {
        file_id: uploadedFile.file_id, // 使用上传成功后返回的file_id
        name: uploadedFile.name, // 文件名
      },
      operations: selectedTemplate.operations, // 选中的模板操作类型
      params: selectedTemplate.params, // 选中模板对应的参数值
    };

    // TODO: 调用后端FFmpeg转换接口
    try {
      const response = await fetch("http://localhost:3000/api/ffmpeg-convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversionPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Conversion API response:", result);
        message.success("FFmpeg 转换请求已发送！");
        // 这里不再 setProgress(0)，由 ws 进度驱动
      } else {
        console.error(
          "Conversion API error:",
          response.status,
          response.statusText
        );
        message.error("FFmpeg 转换请求失败！");
      }
    } catch (error) {
      console.error("Conversion API fetch error:", error);
      message.error("FFmpeg 转换请求出错！");
    }
  };

  // 组件卸载时关闭 ws
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", padding: 32 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Card
          style={{
            borderRadius: 8,
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <MainPanel />
        </Card>
        {/* 上传文件信息展示 */}
        {uploadedFile && (
          <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
            <Space direction="vertical" size={2}>
              <Text strong>当前上传文件：</Text>
              <Text type="secondary">{uploadedFile.name}</Text>
            </Space>
          </Card>
        )}
        {/* 主面板卡片化 */}
        {/* 文件上传卡片化 */}
        <Card
          style={{
            borderRadius: 8,
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          styles={{ body: { padding: 24 } }}
        >
          <FileUploader
            accept=".png,.jpg,.jpeg,.gif,.exe,.rar,.mp4,.wmv,.webm,video/*"
            allowedTypes={[
              "image/png",
              "image/jpeg",
              "image/gif",
              "application/x-rar-compressed",
              "application/x-msdownload",
              "video/mp4",
              "video/webm",
              "video/ogg",
              "video/x-msvideo",
              "video/quicktime",
              "video/x-ms-wmv",
            ]}
            maxSizeMB={300}
            multiple={true}
            apiUrl="/api/file"
            keepAfterUpload={true}
            onRemoveAfterUpload={(file: File & { file_id?: string }) => {
              if (uploadedFile && uploadedFile.file_id === file.file_id) {
                setUploadedFile(null);
              }
              return true;
            }}
            onMergeSuccess={handleUploadSuccess}
            onCheckSuccess={handleUploadSuccess}
          />
        </Card>
        {/* 进度条展示 */}
        {taskId && (
          <Card
            style={{ borderRadius: 8, marginBottom: 24 }}
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ margin: "20px 0" }}>
              <div>
                转换进度：{progress}%
                {progressStage && (
                  <span style={{ marginLeft: 12, color: "#888" }}>
                    当前阶段：{progressStage}
                  </span>
                )}
              </div>
              <div style={{ background: "#eee", height: 10, borderRadius: 5 }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: 10,
                    background: "#1890ff",
                    borderRadius: 5,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          </Card>
        )}
        {/* FFmpeg模板列表 */}
        {uploadedFile && (
          <Button
            type="primary"
            size="large"
            style={{ marginTop: 20, width: "100%", borderRadius: 4 }}
            onClick={handleStartConversion}
            disabled={!selectedTemplateId || hasParamConflicts}
          >
            开始FFmpeg转换
          </Button>
        )}
      </div>
    </div>
  );
}

export default App;
