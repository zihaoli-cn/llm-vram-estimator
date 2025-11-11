import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ParsedModelConfig } from "../../../shared/config-parser";

interface ModelUrlTabProps {
  onConfigLoaded: (config: ParsedModelConfig) => void;
}

export default function ModelUrlTab({ onConfigLoaded }: ModelUrlTabProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFromUrl = trpc.model.fetchFromUrl.useMutation();

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error("请输入URL");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchFromUrl.mutateAsync({ url: url.trim() });
      
      if (result.success && result.data) {
        onConfigLoaded(result.data);
        toast.success("配置文件加载成功");
      } else {
        toast.error(result.error || "加载失败");
      }
    } catch (error) {
      toast.error("获取配置文件失败，请检查URL是否正确");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="model-url">模型仓库URL</Label>
        <div className="flex gap-2">
          <Input
            id="model-url"
            placeholder="例如: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-70B"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          />
          <Button onClick={handleFetch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          支持ModelScope和Hugging Face的模型仓库URL
        </p>
      </div>
    </div>
  );
}
