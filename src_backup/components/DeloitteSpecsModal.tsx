import React from 'react';
import { X, BookOpen, Check, Layers, Share2, HelpCircle } from 'lucide-react';
import { DELOITTE_SKILLS } from '../data/deloitteSkills';

interface DeloitteSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeloitteSpecsModal: React.FC<DeloitteSpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">德勤 (Deloitte) 标准流程图 Draw.io 规范指南</h2>
              <p className="text-xs text-slate-400">完整架构约束、泳道分流、节点样式与 AI 提示词技能规范</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                <Layers className="w-4 h-4" /> 1. 泳道结构 (Swimlanes)
              </span>
              <p className="text-slate-400">
                按部门/岗位分栏，水平方向延伸。第一泳道放置流程【开始】与【结束】圆点。
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
              <span className="text-blue-400 font-bold flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" /> 2. 编号与名称 (Numbering)
              </span>
              <p className="text-slate-400">
                活动框内第一行为粗体统一编号 (如 4.2.1 或 01)，第二行为精简动宾短语名称。
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
              <span className="text-amber-400 font-bold flex items-center gap-1 text-xs">
                <Share2 className="w-4 h-4" /> 3. 关联输入/输出 (Docs/Sys)
              </span>
              <p className="text-slate-400">
                系统名称 (ERP/MES) 在步骤上方，输入/输出表单文档《xxx》置于步骤下方。
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200 text-xs text-emerald-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>德勤标准 AI 技能文档原文 (Full Skill Prompt Reference)</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {DELOITTE_SKILLS}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition text-xs"
          >
            知道了 / 返回编辑器
          </button>
        </div>
      </div>
    </div>
  );
};
