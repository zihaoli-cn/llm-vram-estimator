import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { estimateVRAM, type ModelConfig, type VRAMEstimation } from "../shared/vram-calculator";
import { parseTransformersConfig, estimateTotalParameters } from "../shared/config-parser";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // GPU related procedures
  gpu: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchGPUs(input.query);
      }),
    
    getAll: publicProcedure
      .query(async () => {
        return await db.getAllGPUs();
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getGPUById(input.id);
      }),
  }),

  // Model configuration procedures
  model: router({
    // Parse config from JSON
    parseConfig: publicProcedure
      .input(z.object({ 
        configJson: z.string(),
        source: z.enum(['search', 'url', 'upload', 'manual']).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const config = JSON.parse(input.configJson);
          const parsed = parseTransformersConfig(config);
          
          // If totalParameters is not provided, estimate it
          if (!parsed.totalParameters && parsed.numLayers && parsed.hiddenSize) {
            parsed.totalParameters = estimateTotalParameters(parsed);
          }
          
          return {
            success: true,
            data: parsed,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse config',
          };
        }
      }),
    
    // Fetch config from ModelScope URL
    fetchFromUrl: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          // Parse ModelScope/HuggingFace URL to get config.json URL
          let configUrl = input.url;
          
          // Convert repo URL to config.json URL
          if (configUrl.includes('modelscope.cn/models/')) {
            // https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
            // -> https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-70B/resolve/master/config.json
            if (!configUrl.endsWith('config.json')) {
              configUrl = configUrl.replace(/\/$/, '') + '/resolve/master/config.json';
            }
          } else if (configUrl.includes('huggingface.co/')) {
            // https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
            // -> https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B/resolve/main/config.json
            if (!configUrl.endsWith('config.json')) {
              configUrl = configUrl.replace(/\/$/, '') + '/resolve/main/config.json';
            }
          }
          
          const response = await fetch(configUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
          }
          
          const configJson = await response.json();
          const parsed = parseTransformersConfig(configJson);
          
          // If totalParameters is not provided, estimate it
          if (!parsed.totalParameters && parsed.numLayers && parsed.hiddenSize) {
            parsed.totalParameters = estimateTotalParameters(parsed);
          }
          
          return {
            success: true,
            data: parsed,
            configJson: JSON.stringify(configJson, null, 2),
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch config from URL',
          };
        }
      }),
  }),

  // VRAM estimation procedures
  vram: router({
    estimate: publicProcedure
      .input(z.object({
        // Model parameters
        totalParameters: z.union([z.number(), z.string()]).optional(),
        numLayers: z.number().optional(),
        hiddenSize: z.number().optional(),
        numAttentionHeads: z.number().optional(),
        numKvHeads: z.number().optional(),
        headDim: z.number().optional(),
        
        // Inference config
        quantization: z.enum(['FP16', 'BF16', 'FP8', 'INT8', 'INT4']),
        batchSize: z.number().min(1),
        seqLength: z.number().min(1),
        systemOverheadPercent: z.number().min(0).max(100).optional(),
        
        // GPU config
        gpuId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const config: ModelConfig = {
          totalParameters: input.totalParameters,
          numLayers: input.numLayers,
          hiddenSize: input.hiddenSize,
          numAttentionHeads: input.numAttentionHeads,
          numKvHeads: input.numKvHeads,
          headDim: input.headDim,
          quantization: input.quantization,
          batchSize: input.batchSize,
          seqLength: input.seqLength,
          systemOverheadPercent: input.systemOverheadPercent,
        };
        
        // Get GPU VRAM capacity if GPU is selected
        let gpuVRAMCapacityGB: number | undefined;
        if (input.gpuId) {
          const gpu = await db.getGPUById(input.gpuId);
          if (gpu) {
            gpuVRAMCapacityGB = gpu.vramCapacityGB;
          }
        }
        
        const estimation = estimateVRAM(config, gpuVRAMCapacityGB);
        
        return estimation;
      }),
  }),

  // History procedures
  history: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserModelHistory(ctx.user.id);
      }),
    
    save: protectedProcedure
      .input(z.object({
        modelName: z.string().optional(),
        modelSource: z.string().optional(),
        totalParameters: z.string().optional(),
        numLayers: z.number().optional(),
        hiddenSize: z.number().optional(),
        numAttentionHeads: z.number().optional(),
        numKvHeads: z.number().optional(),
        headDim: z.number().optional(),
        attentionType: z.string().optional(),
        quantization: z.string().optional(),
        batchSize: z.number().optional(),
        seqLength: z.number().optional(),
        systemOverheadPercent: z.number().optional(),
        gpuModelId: z.number().optional(),
        configJson: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveModelHistory({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteModelHistory(input.id, ctx.user.id);
        return { success: true };
      }),
    
    clearAll: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.clearUserModelHistory(ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
