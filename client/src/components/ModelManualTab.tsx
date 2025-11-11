import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { ParsedModelConfig } from "../../../shared/config-parser";

interface ModelManualTabProps {
  onConfigLoaded: (config: ParsedModelConfig) => void;
}

export default function ModelManualTab({ onConfigLoaded }: ModelManualTabProps) {
  const [formData, setFormData] = useState({
    modelName: "",
    totalParameters: "",
    numLayers: "",
    hiddenSize: "",
    numAttentionHeads: "",
    numKvHeads: "",
    headDim: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const config: ParsedModelConfig = {
      modelName: formData.modelName || undefined,
      totalParameters: formData.totalParameters || undefined,
      numLayers: formData.numLayers ? parseInt(formData.numLayers) : undefined,
      hiddenSize: formData.hiddenSize ? parseInt(formData.hiddenSize) : undefined,
      numAttentionHeads: formData.numAttentionHeads ? parseInt(formData.numAttentionHeads) : undefined,
      numKvHeads: formData.numKvHeads ? parseInt(formData.numKvHeads) : undefined,
      headDim: formData.headDim ? parseInt(formData.headDim) : undefined,
    };

    onConfigLoaded(config);
    toast.success("手动配置已加载");
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="manual-model-name">模型名称（可选）</Label>
          <Input
            id="manual-model-name"
            placeholder="例如: My Custom Model"
            value={formData.modelName}
            onChange={(e) => handleInputChange('modelName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-total-params">总参数量</Label>
          <Input
            id="manual-total-params"
            placeholder="例如: 70B 或 70000000000"
            value={formData.totalParameters}
            onChange={(e) => handleInputChange('totalParameters', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-num-layers">层数</Label>
          <Input
            id="manual-num-layers"
            type="number"
            placeholder="例如: 80"
            value={formData.numLayers}
            onChange={(e) => handleInputChange('numLayers', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-hidden-size">隐藏层大小</Label>
          <Input
            id="manual-hidden-size"
            type="number"
            placeholder="例如: 8192"
            value={formData.hiddenSize}
            onChange={(e) => handleInputChange('hiddenSize', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-num-heads">注意力头数</Label>
          <Input
            id="manual-num-heads"
            type="number"
            placeholder="例如: 64"
            value={formData.numAttentionHeads}
            onChange={(e) => handleInputChange('numAttentionHeads', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-num-kv-heads">KV头数</Label>
          <Input
            id="manual-num-kv-heads"
            type="number"
            placeholder="例如: 8"
            value={formData.numKvHeads}
            onChange={(e) => handleInputChange('numKvHeads', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-head-dim">单头维度</Label>
          <Input
            id="manual-head-dim"
            type="number"
            placeholder="例如: 128"
            value={formData.headDim}
            onChange={(e) => handleInputChange('headDim', e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full">
        <Check className="h-4 w-4 mr-2" />
        确认配置
      </Button>
    </div>
  );
}
