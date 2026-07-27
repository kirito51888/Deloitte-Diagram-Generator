import React from 'react';
import { X, Settings, Key, Cpu, Thermometer, ShieldCheck } from 'lucide-react';
import { AiConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiConfig;
  onChangeConfig: (newConfig: AiConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-5 shadow-2xl text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">AI 生成引擎与系统配置</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {/* Model selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>AI 模型选择</span>
            </label>
            <select
              value={config.model}
              onChange={(e) => onChangeConfig({ ...config, model: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium text-xs"
            >
              <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (推荐·默认高速)</option>
              <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (深度推理)</option>
              <option value="mimo-v2.5">小米 MiMo v2.5 (大模型·Deloitte 图表生成)</option>
            </select>
          </div>

          {/* Gemini API Key */}
          {!config.model.includes('mimo') && (
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini API Key (可选)</span>
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => onChangeConfig({ ...config, apiKey: e.target.value })}
                placeholder="留空则自动使用 AI Studio 内置 GEMINI_API_KEY"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>无需手动输入! AI Studio 默认已安全注入 Gemini 服务端秘钥。</span>
              </p>
            </div>
          )}

          {/* MiMo API Key */}
          {config.model.includes('mimo') && (
            <div className="space-y-1.5 bg-amber-950/30 border border-amber-800/50 p-3 rounded-lg">
              <label className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>小米 MiMo API Key</span>
              </label>
              <input
                type="password"
                value={config.mimoApiKey || config.apiKey || ''}
                onChange={(e) =>
                  onChangeConfig({ ...config, mimoApiKey: e.target.value, apiKey: e.target.value })
                }
                placeholder="输入你的小米 MiMo API Key (或系统环境变量 MIMO_API_KEY)"
                className="w-full bg-slate-950 border border-amber-700/80 rounded-lg p-2 text-amber-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
              <p className="text-[10px] text-amber-400/80">
                支持小米 MiMo v2.5 流程大模型。接口标准：https://api.xiaomimimo.com/v1/chat/completions
              </p>
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>生成创造度 (Temperature)</span>
              </label>
              <span className="font-mono text-emerald-400">{config.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={config.temperature}
              onChange={(e) =>
                onChangeConfig({ ...config, temperature: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-500 bg-slate-950"
            />
            <p className="text-[10px] text-slate-500">
              较小值 (0.2 - 0.4) 能更严谨地依循流程文本；较大值提升图表排版多样性。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
