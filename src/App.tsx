import { Button, message } from "antd";
import { FFmpegList, FFmpegPanel } from "./components/FFmpegConvert";

import FileUploader from "./components/FileUploader";
import { useFFmpegPanelStore } from "./components/FFmpegConvert/store";
import { useState } from "react";

function App() {
  // 存储上传的文件信息，使用联合类型 File & { file_id: string } | null
  const [uploadedFile, setUploadedFile] = useState<
    (File & { file_id: string }) | null
  >(null);
  const { templates, selectedTemplateId, hasParamConflicts } =
    useFFmpegPanelStore();

  // 合并处理文件上传成功和文件检查成功的逻辑
  const handleUploadSuccess = (file: File, res: any) => {
    console.log("File upload/check success:", file, res);

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

    // 构建发送给后端的数据载荷
    const conversionPayload = {
      // 添加file_id到payload，用于后端识别文件
      file: {
        file_id: uploadedFile.file_id, // 使用上传成功后返回的file_id
        name: uploadedFile.name, // 文件名
      },
      // 使用选中模板的操作和参数
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
        // TODO: 根据后端返回更新处理状态和进度
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

  return (
    <div className="app-container">
      <FFmpegPanel />
      {/* 文件上传组件 */}
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
        multiple={true} // 根据用户修改保留为true，允许上传多个文件，但目前FFmpegPanel只处理第一个文件
        apiUrl="/api/file"
        keepAfterUpload={true}
        // file参数是File类型，但实际有uid，使用类型断言
        onRemoveAfterUpload={(file: File & { file_id?: string }, reason) => {
          console.log(file, reason);
          // 如果移除的是当前已上传文件（通过 file_id 判断），清空 uploadedFile 状态
          if (uploadedFile && uploadedFile.file_id === file.file_id) {
            setUploadedFile(null);
          }
          return true; // 允许移除
        }}
        onMergeSuccess={handleUploadSuccess} // 使用合并后的处理函数
        onCheckSuccess={handleUploadSuccess} // 使用合并后的处理函数
      />

      {/* FFmpeg模板列表 */}
      {uploadedFile && ( // 只有文件上传成功后才显示模板列表和转换按钮
        <>
          <FFmpegList />
          <Button
            type="primary"
            size="large"
            style={{ marginTop: 20 }}
            onClick={handleStartConversion}
            disabled={!selectedTemplateId || hasParamConflicts} // 同时检查 selectedTemplateId 和 hasParamConflicts
          >
            开始FFmpeg转换
          </Button>
        </>
      )}
    </div>
  );
}

export default App;
