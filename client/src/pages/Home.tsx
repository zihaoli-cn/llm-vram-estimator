import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import ModelSearchTab from "@/components/ModelSearchTab";
import ModelUrlTab from "@/components/ModelUrlTab";
import ModelUploadTab from "@/components/ModelUploadTab";
import ModelManualTab from "@/components/ModelManualTab";
import EstimationForm from "@/components/EstimationForm";
import EstimationResults from "@/components/EstimationResults";
import type { ParsedModelConfig } from "../../../shared/config-parser";
import type { VRAMEstimation } from "../../../shared/vram-calculator";

export default function Home() {
  const [modelConfig, setModelConfig] = useState<ParsedModelConfig | null>(null);
  const [estimation, setEstimation] = useState<VRAMEstimation | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {APP_TITLE}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            估算大语言模型推理时的GPU显存使用量
          </p>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Input */}
          <div className="space-y-6">
            {/* Model Input Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>模型信息输入</CardTitle>
                <CardDescription>
                  选择一种方式获取模型配置信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="search" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="search">搜索</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="upload">上传</TabsTrigger>
                    <TabsTrigger value="manual">手动</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="search">
                    <ModelSearchTab onConfigLoaded={setModelConfig} />
                  </TabsContent>
                  
                  <TabsContent value="url">
                    <ModelUrlTab onConfigLoaded={setModelConfig} />
                  </TabsContent>
                  
                  <TabsContent value="upload">
                    <ModelUploadTab onConfigLoaded={setModelConfig} />
                  </TabsContent>
                  
                  <TabsContent value="manual">
                    <ModelManualTab onConfigLoaded={setModelConfig} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Estimation Form */}
            <EstimationForm 
              modelConfig={modelConfig}
              onEstimate={setEstimation}
            />
          </div>

          {/* Right Column: Results */}
          <div>
            <EstimationResults estimation={estimation} />
          </div>
        </div>
      </main>
    </div>
  );
}
