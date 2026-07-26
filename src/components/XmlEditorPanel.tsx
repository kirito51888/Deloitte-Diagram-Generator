import React, { useState } from 'react';
import { FileCode, FileText, Copy, Download, RefreshCw, Send, Check } from 'lucide-react';

interface XmlEditorPanelProps {
  processInfoText: string;
  onProcessInfoChange: (val: string) => void;
  xmlContent: string;
  onXmlChange: (val: string) => void;
  onLoadXmlToDrawio: () => void;
  onAiGenerate: () => void;
  isAiGenerating: boolean;
  statusText: string;
}

export const XmlEditorPanel: React.FC<XmlEditorPanelProps> = ({
  processInfoText,
  onProcessInfoChange,
  xmlContent,
  onXmlChange,
  onLoadXmlToDrawio,
  onAiGenerate,
  isAiGenerating,
  statusText,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'xml'>('info');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'xml' ? xmlContent : processInfoText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-xs">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition ${
              activeTab === 'info'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>流程描述 (Prompt)</span>
          </button>

          <button
            onClick={() => setActiveTab('xml')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition ${
              activeTab === 'xml'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Draw.io XML 代码</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {statusText}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-slate-950">
        {activeTab === 'info' ? (
          <div className="flex-1 flex flex-col p-3 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>德勤 Prompt 流程定义文本 (可通过表单自动生成或手动调整)</span>
              <button
                onClick={onAiGenerate}
                disabled={isAiGenerating}
                className="text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>发送此描述给 AI 生成</span>
              </button>
            </div>
            <textarea
              value={processInfoText}
              onChange={(e) => onProcessInfoChange(e.target.value)}
              className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono leading-relaxed text-xs focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="在此输入流程步骤说明..."
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-3 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Draw.io XML 结构代码 (修改后可手动同步至预览编辑器)</span>
              <button
                onClick={onLoadXmlToDrawio}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-2.5 py-1 rounded flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>同步至 Draw.io 画布</span>
              </button>
            </div>
            <textarea
              value={xmlContent}
              onChange={(e) => onXmlChange(e.target.value)}
              className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-emerald-300 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-emerald-500 resize-none selection:bg-emerald-900"
              placeholder="<?xml version=...>"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
