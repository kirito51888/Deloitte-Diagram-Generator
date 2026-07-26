import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { DELOITTE_SKILLS } from './src/data/deloitteSkills.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: Generate Deloitte Draw.io Diagram using Gemini or Xiaomi MiMo AI
  app.post('/api/generate-diagram', async (req, res) => {
    try {
      const { processInfo, apiKey: userKey, modelName, temperature, mimoApiKey } = req.body;

      if (!processInfo || typeof processInfo !== 'string') {
        return res.status(400).json({ error: 'Process information (processInfo) is required.' });
      }

      const selectedModel = modelName || 'gemini-3.6-flash';

      const systemInstruction = `你是 Draw.io XML 生成专家，精通 Deloitte 德勤标准流程图规范。
请严格按照用户提供的流程信息和德勤规范生成合法、完整的 Draw.io XML 文件 (<mxfile>...</mxfile>)。
【关键指令】：
1. 必须完全保留用户流程信息中的活动编号、活动名称、角色泳道分流与输入/输出文档。
2. 绝对禁止改变活动编号或遗漏步骤。
3. 只输出 XML 代码 (以 <mxfile ...> 开头，以 </mxfile> 结尾)，不要有任何 Markdown 代码块标签以外的额外闲聊说明。`;

      const userPrompt = `## 任务
根据下面提供的【流程信息】，生成一个严格符合【德勤标准约束】的 Draw.io XML 文件。

---

## 流程信息
${processInfo}

---

## 德勤标准约束（必须严格遵守）
${DELOITTE_SKILLS}`;

      // Branch 1: Xiaomi MiMo LLM Model
      if (selectedModel.toLowerCase().includes('mimo')) {
        const activeMimoKey =
          (mimoApiKey && mimoApiKey.trim()) ||
          (userKey && userKey.trim()) ||
          process.env.MIMO_API_KEY;

        if (!activeMimoKey) {
          return res.status(400).json({
            error:
              '未提供小米 MiMo API Key。请在设置中输入 Key，或配置 MIMO_API_KEY 环境变量。',
          });
        }

        const mimoResp = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeMimoKey}`,
            'api-key': activeMimoKey,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt },
            ],
            temperature: typeof temperature === 'number' ? temperature : 0.3,
          }),
        });

        if (!mimoResp.ok) {
          const errText = await mimoResp.text();
          return res.status(mimoResp.status).json({
            error: `小米 MiMo API 请求错误 (${mimoResp.status}): ${errText}`,
          });
        }

        const data = await mimoResp.json();
        const text = data.choices?.[0]?.message?.content || '';
        const xmlMatch = text.match(/<mxfile[\s\S]*?<\/mxfile>/);

        if (xmlMatch) {
          return res.json({
            success: true,
            xml: xmlMatch[0],
            raw: text,
          });
        } else {
          return res.status(422).json({
            error: '小米 MiMo 模型未返回标准的 <mxfile> XML 结构。',
            raw: text,
          });
        }
      }

      // Branch 2: Google Gemini Model
      const activeGeminiKey = (userKey && userKey.trim()) || process.env.GEMINI_API_KEY;

      if (!activeGeminiKey) {
        return res.status(400).json({
          error:
            '未配置 Gemini API Key。请在设置中输入 Gemini 秘钥或配置 GEMINI_API_KEY 环境变量。',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: activeGeminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: typeof temperature === 'number' ? temperature : 0.3,
        },
      });

      const text = response.text || '';
      const xmlMatch = text.match(/<mxfile[\s\S]*?<\/mxfile>/);

      if (xmlMatch) {
        return res.json({
          success: true,
          xml: xmlMatch[0],
          raw: text,
        });
      } else {
        return res.status(422).json({
          error: 'Gemini AI 未能返回有效的 <mxfile> XML 标签。',
          raw: text,
        });
      }
    } catch (err: any) {
      console.error('Error generating diagram with AI API:', err);
      return res.status(500).json({
        error: err.message || '生成流程图时发生错误。',
      });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Deloitte Diagram Generator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
