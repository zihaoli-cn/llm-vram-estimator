import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ParsedModelConfig } from "../../../shared/config-parser";

interface ModelUploadTabProps {
  onConfigLoaded: (config: ParsedModelConfig) => void;
}

export default function ModelUploadTab({ onConfigLoaded }: ModelUploadTabProps) {
  const [fileName, setFileName] = useState("");

  const parseConfig = trpc.model.parseConfig.useMutation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      toast.error("请上传JSON文件");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error("文件大小不能超过1MB");
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const result = await parseConfig.mutateAsync({ 
        configJson: text,
        source: 'upload',
      });

      if (result.success && result.data) {
        onConfigLoaded(result.data);
        toast.success("配置文件解析成功");
      } else {
        toast.error(result.error || "解析失败");
      }
    } catch (error) {
      toast.error("文件读取失败");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="config-upload">上传 config.json</Label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => document.getElementById('config-upload')?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {fileName || "选择文件"}
          </Button>
          <input
            id="config-upload"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          支持上传transformers库的config.json文件（最大1MB）
        </p>
      </div>
    </div>
  );
}
