import React from 'react';
import { Layers, Sparkles, BookOpen, Settings, Download, Copy, Play } from 'lucide-react';

interface HeaderProps {
  onOpenSpecs: () => void;
  onOpenSettings: () => void;
  onInstantGenerate: () => void;
  onAiGenerate: () => void;
  isAiGenerating: boolean;
  onDownload: () => void;
  onCopy: () => void;
  pName: string;
  pCode: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSpecs,
  onOpenSettings,
  onInstantGenerate,
  onAiGenerate,
  isAiGenerating,
  onDownload,
  onCopy,
  pName,
  pCode,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 text-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
          <Layers className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">
              德勤流程图自动生成工具
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
              v24 Deloitte Standard
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {pCode ? `[${pCode}] ` : ''}
            {pName || '德勤标准泳道流程图'} · Draw.io AI 智能生成
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          onClick={onOpenSpecs}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition font-medium"
          title="查看德勤流程图规范"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>德勤规范指南</span>
        </button>

        <button
          onClick={onInstantGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition font-medium"
          title="根据表单即时生成 Draw.io XML (无需 AI)"
        >
          <Play className="w-3.5 h-3.5 text-blue-400" />
          <span>速绘 (表单直接生成)</span>
        </button>

        <button
          onClick={onAiGenerate}
          disabled={isAiGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-md font-semibold shadow-sm transition"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
          <span>{isAiGenerating ? 'AI 生成中...' : 'AI 智能生成 XML'}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 my-auto hidden sm:block" />

        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
          title="复制 Draw.io XML 代码"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">复制</span>
        </button>

        <button
          onClick={onDownload}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
          title="下载 .drawio 文件"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">导出</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition"
          title="系统设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
