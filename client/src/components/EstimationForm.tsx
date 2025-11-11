import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { determineAttentionType } from "../../../shared/vram-calculator";
import type { ParsedModelConfig } from "../../../shared/config-parser";
import type { VRAMEstimation, QuantizationType } from "../../../shared/vram-calculator";

interface EstimationFormProps {
  modelConfig: ParsedModelConfig | null;
  onEstimate: (estimation: VRAMEstimation) => void;
}

export default function EstimationForm({ modelConfig, onEstimate }: EstimationFormProps) {
  // Model parameters
  const [totalParameters, setTotalParameters] = useState("");
  const [numLayers, setNumLayers] = useState("");
  const [hiddenSize, setHiddenSize] = useState("");
  const [numAttentionHeads, setNumAttentionHeads] = useState("");
  const [numKvHeads, setNumKvHeads] = useState("");
  const [headDim, setHeadDim] = useState("");

  // Inference config
  const [quantization, setQuantization] = useState<QuantizationType>("INT4");
  const [batchSize, setBatchSize] = useState("32");
  const [seqLength, setSeqLength] = useState("4096");
  const [systemOverhead, setSystemOverhead] = useState("20");

  // GPU config
  const [selectedGpuId, setSelectedGpuId] = useState<number | undefined>();
  const [gpuSearchQuery, setGpuSearchQuery] = useState("");

  const gpuSearch = trpc.gpu.search.useQuery({ query: gpuSearchQuery }, {
    enabled: gpuSearchQuery.length > 0,
  });

  const estimate = trpc.vram.estimate.useMutation();

  // Update form when modelConfig changes
  useEffect(() => {
    if (modelConfig) {
      setTotalParameters(modelConfig.totalParameters?.toString() || "");
      setNumLayers(modelConfig.numLayers?.toString() || "");
      setHiddenSize(modelConfig.hiddenSize?.toString() || "");
      setNumAttentionHeads(modelConfig.numAttentionHeads?.toString() || "");
      setNumKvHeads(modelConfig.numKvHeads?.toString() || "");
      setHeadDim(modelConfig.headDim?.toString() || "");
    }
  }, [modelConfig]);

  // Calculate attention type
  const attentionInfo = determineAttentionType({
    numAttentionHeads: numAttentionHeads ? parseInt(numAttentionHeads) : undefined,
    numKvHeads: numKvHeads ? parseInt(numKvHeads) : undefined,
    quantization,
    batchSize: parseInt(batchSize) || 1,
    seqLength: parseInt(seqLength) || 1,
  });

  const handleEstimate = async () => {
    // Validate required fields
    if (!numLayers || !headDim) {
      toast.error("请至少填写层数和单头维度");
      return;
    }

    try {
      const result = await estimate.mutateAsync({
        totalParameters: totalParameters || undefined,
        numLayers: parseInt(numLayers),
        hiddenSize: hiddenSize ? parseInt(hiddenSize) : undefined,
        numAttentionHeads: numAttentionHeads ? parseInt(numAttentionHeads) : undefined,
        numKvHeads: numKvHeads ? parseInt(numKvHeads) : undefined,
        headDim: parseInt(headDim),
        quantization,
        batchSize: parseInt(batchSize),
        seqLength: parseInt(seqLength),
        systemOverheadPercent: parseFloat(systemOverhead),
        gpuId: selectedGpuId,
      });

      onEstimate(result);
      toast.success("估算完成");
    } catch (error) {
      toast.error("估算失败");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>估算配置</CardTitle>
        <CardDescription>
          配置推理参数和硬件信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Parameters */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">模型参数</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total-params">总参数量</Label>
              <Input
                id="total-params"
                placeholder="例如: 70B"
                value={totalParameters}
                onChange={(e) => setTotalParameters(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-layers">层数 *</Label>
              <Input
                id="num-layers"
                type="number"
                placeholder="例如: 80"
                value={numLayers}
                onChange={(e) => setNumLayers(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hidden-size">隐藏层大小</Label>
              <Input
                id="hidden-size"
                type="number"
                placeholder="例如: 8192"
                value={hiddenSize}
                onChange={(e) => setHiddenSize(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-heads">注意力头数</Label>
              <Input
                id="num-heads"
                type="number"
                placeholder="例如: 64"
                value={numAttentionHeads}
                onChange={(e) => setNumAttentionHeads(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-kv-heads">KV头数</Label>
              <Input
                id="num-kv-heads"
                type="number"
                placeholder="例如: 8"
                value={numKvHeads}
                onChange={(e) => setNumKvHeads(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="head-dim">单头维度 *</Label>
              <Input
                id="head-dim"
                type="number"
                placeholder="例如: 128"
                value={headDim}
                onChange={(e) => setHeadDim(e.target.value)}
              />
            </div>
          </div>

          {/* Attention Type Display */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Label className="text-sm font-medium">Attention架构:</Label>
            <span className="font-mono text-sm font-semibold">{attentionInfo.type}</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{attentionInfo.reason}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Inference Config */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">推理配置</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantization">量化精度</Label>
              <Select value={quantization} onValueChange={(v) => setQuantization(v as QuantizationType)}>
                <SelectTrigger id="quantization">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP16">FP16 / BF16 (2 bytes)</SelectItem>
                  <SelectItem value="BF16">BF16 (2 bytes)</SelectItem>
                  <SelectItem value="FP8">FP8 (1 byte)</SelectItem>
                  <SelectItem value="INT8">INT8 (1 byte)</SelectItem>
                  <SelectItem value="INT4">INT4 (0.5 bytes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-size">并发用户数</Label>
              <Input
                id="batch-size"
                type="number"
                min="1"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seq-length">序列长度</Label>
              <Input
                id="seq-length"
                type="number"
                min="1"
                value={seqLength}
                onChange={(e) => setSeqLength(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-overhead">系统开销 (%)</Label>
              <Input
                id="system-overhead"
                type="number"
                min="0"
                max="100"
                value={systemOverhead}
                onChange={(e) => setSystemOverhead(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* GPU Config */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">硬件配置</h3>
          
          <div className="space-y-2">
            <Label htmlFor="gpu-model">GPU型号</Label>
            <Input
              id="gpu-model"
              placeholder="搜索GPU型号，例如: A100, 4090"
              value={gpuSearchQuery}
              onChange={(e) => setGpuSearchQuery(e.target.value)}
            />
            {gpuSearch.data && gpuSearch.data.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {gpuSearch.data.map((gpu) => (
                  <button
                    key={gpu.id}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                    onClick={() => {
                      setSelectedGpuId(gpu.id);
                      setGpuSearchQuery(gpu.modelName);
                    }}
                  >
                    <div className="font-medium">{gpu.modelName}</div>
                    <div className="text-sm text-muted-foreground">{gpu.vramCapacityGB} GB VRAM</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleEstimate} className="w-full" disabled={estimate.isPending}>
          <Calculator className="h-4 w-4 mr-2" />
          {estimate.isPending ? "计算中..." : "开始估算"}
        </Button>
      </CardContent>
    </Card>
  );
}
