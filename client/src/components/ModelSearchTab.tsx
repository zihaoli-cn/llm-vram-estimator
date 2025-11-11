import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ParsedModelConfig } from "../../../shared/config-parser";

interface ModelSearchTabProps {
  onConfigLoaded: (config: ParsedModelConfig) => void;
}

export default function ModelSearchTab({ onConfigLoaded }: ModelSearchTabProps) {
  const [modelName, setModelName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFromUrl = trpc.model.fetchFromUrl.useMutation();

  const handleSearch = async () => {
    if (!modelName.trim()) {
      toast.error("请输入模型名称");
      return;
    }

    setLoading(true);
    try {
      // Convert model name to ModelScope URL
      const url = `https://www.modelscope.cn/models/${modelName.trim()}`;
      
      const result = await fetchFromUrl.mutateAsync({ url });
      
      if (result.success && result.data) {
        onConfigLoaded(result.data);
        toast.success("模型配置加载成功");
      } else {
        toast.error(result.error || "加载失败");
      }
    } catch (error) {
      toast.error("搜索模型失败，请检查模型名称是否正确");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="model-name">模型名称</Label>
        <div className="flex gap-2">
          <Input
            id="model-name"
            placeholder="例如: deepseek-ai/DeepSeek-R1-Distill-Llama-70B"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          输入ModelScope或Hugging Face的模型名称，例如: organization/model-name
        </p>
      </div>
    </div>
  );
}
