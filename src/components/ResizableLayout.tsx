import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GripVertical,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Columns,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface ResizableLayoutProps {
  leftPane: React.ReactNode;
  middlePane: React.ReactNode;
  rightPane: (props: { isWideView: boolean; onToggleWideView: () => void }) => React.ReactNode;
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  leftPane,
  middlePane,
  rightPane,
}) => {
  const DEFAULT_LEFT_PERCENT = 26;
  const DEFAULT_MIDDLE_PERCENT = 28;

  // Percentages for left and middle panels
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('deloitte_panel_left');
    return saved ? parseFloat(saved) : DEFAULT_LEFT_PERCENT;
  });

  const [middleWidth, setMiddleWidth] = useState<number>(() => {
    const saved = localStorage.getItem('deloitte_panel_middle');
    return saved ? parseFloat(saved) : DEFAULT_MIDDLE_PERCENT;
  });

  // Collapsed states for left and middle panels
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState<boolean>(false);

  const [activeResizer, setActiveResizer] = useState<'left' | 'middle' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Mobile active tab for small screens
  const [mobileTab, setMobileTab] = useState<'form' | 'editor' | 'preview'>('preview');

  // Save layout state
  useEffect(() => {
    localStorage.setItem('deloitte_panel_left', leftWidth.toString());
  }, [leftWidth]);

  useEffect(() => {
    localStorage.setItem('deloitte_panel_middle', middleWidth.toString());
  }, [middleWidth]);

  const handleMouseDown = (resizer: 'left' | 'middle') => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveResizer(resizer);
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const handleResetLayout = () => {
    setIsLeftCollapsed(false);
    setIsMiddleCollapsed(false);
    setLeftWidth(DEFAULT_LEFT_PERCENT);
    setMiddleWidth(DEFAULT_MIDDLE_PERCENT);
  };

  // Toggle Focus / Wide Canvas Mode (Collapses left & middle panels)
  const isWideView = isLeftCollapsed && isMiddleCollapsed;

  const handleToggleWideView = () => {
    if (isWideView) {
      // Restore default 3-column view
      setIsLeftCollapsed(false);
      setIsMiddleCollapsed(false);
    } else {
      // Focus diagram mode (collapse left & middle)
      setIsLeftCollapsed(true);
      setIsMiddleCollapsed(true);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current || !activeResizer) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      if (containerWidth <= 0) return;

      const mouseX = e.clientX - rect.left;
      const mousePercent = (mouseX / containerWidth) * 100;

      if (activeResizer === 'left') {
        const newLeft = Math.min(Math.max(mousePercent, 12), 45);
        setLeftWidth(newLeft);
        if (isLeftCollapsed) setIsLeftCollapsed(false);
      } else if (activeResizer === 'middle') {
        const currentLeftEffective = isLeftCollapsed ? 2 : leftWidth;
        const relativePercent = mousePercent - currentLeftEffective;
        const newMiddle = Math.min(Math.max(relativePercent, 12), 50);

        if (currentLeftEffective + newMiddle <= 80) {
          setMiddleWidth(newMiddle);
          if (isMiddleCollapsed) setIsMiddleCollapsed(false);
        }
      }
    },
    [activeResizer, leftWidth, isLeftCollapsed, isMiddleCollapsed]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setActiveResizer(null);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, []);

  useEffect(() => {
    if (activeResizer) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeResizer, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex bg-slate-900 border-b border-slate-800 text-xs">
        <button
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 text-center font-medium ${
            mobileTab === 'form'
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          1. 结构化配置
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-center font-medium ${
            mobileTab === 'editor'
              ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2. XML/Prompt
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-center font-medium ${
            mobileTab === 'preview'
              ? 'text-purple-400 border-b-2 border-purple-500 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3. 流程图画布
        </button>
      </div>

      {/* Desktop Resizable Layout Container */}
      <div
        ref={containerRef}
        className="flex-1 hidden md:flex h-full w-full overflow-hidden relative select-none"
      >
        {/* Fullscreen Transparent Drag Shield */}
        {activeResizer && (
          <div className="fixed inset-0 z-50 cursor-col-resize bg-transparent" />
        )}

        {/* Left Pane */}
        {isLeftCollapsed ? (
          <div
            onClick={() => setIsLeftCollapsed(false)}
            className="w-9 h-full bg-slate-900 hover:bg-slate-850 border-r border-slate-800 flex flex-col items-center py-3 cursor-pointer shrink-0 transition-colors group"
            title="点击展开：1. 结构化表单配置"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLeftCollapsed(false);
              }}
              className="p-1 text-slate-400 group-hover:text-emerald-400 hover:bg-slate-800 rounded transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-6 [writing-mode:vertical-lr] text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400 tracking-wider">
              1. 结构化表单配置
            </div>
          </div>
        ) : (
          <div
            style={{ width: `${leftWidth}%` }}
            className="h-full overflow-hidden flex flex-col shrink-0 relative"
          >
            {leftPane}
          </div>
        )}

        {/* Resizer 1 (Left <-> Middle) */}
        {!isLeftCollapsed && (
          <div
            onMouseDown={handleMouseDown('left')}
            className={`w-2 hover:w-2 group relative flex items-center justify-center shrink-0 cursor-col-resize transition-colors z-20 ${
              activeResizer === 'left' ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-emerald-500/80'
            }`}
            title="拖拽调整宽度 (可双击重置)"
          >
            <button
              onClick={() => setIsLeftCollapsed(true)}
              className="absolute -left-2 z-30 opacity-0 group-hover:opacity-100 p-0.5 bg-slate-800 hover:bg-emerald-600 text-slate-200 rounded border border-slate-700 shadow transition"
              title="折叠收起表单"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-slate-100 flex items-center justify-center">
              <GripVertical className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-900" />
            </div>
          </div>
        )}

        {/* Middle Pane */}
        {isMiddleCollapsed ? (
          <div
            onClick={() => setIsMiddleCollapsed(false)}
            className="w-9 h-full bg-slate-900 hover:bg-slate-850 border-r border-slate-800 flex flex-col items-center py-3 cursor-pointer shrink-0 transition-colors group"
            title="点击展开：2. XML & Prompt 编辑器"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMiddleCollapsed(false);
              }}
              className="p-1 text-slate-400 group-hover:text-blue-400 hover:bg-slate-800 rounded transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-6 [writing-mode:vertical-lr] text-[11px] font-semibold text-slate-400 group-hover:text-blue-400 tracking-wider">
              2. XML / Prompt
            </div>
          </div>
        ) : (
          <div
            style={{
              width: `${middleWidth}%`,
            }}
            className="h-full overflow-hidden flex flex-col shrink-0 relative"
          >
            {middlePane}
          </div>
        )}

        {/* Resizer 2 (Middle <-> Right) */}
        {!isMiddleCollapsed && (
          <div
            onMouseDown={handleMouseDown('middle')}
            className={`w-2 hover:w-2 group relative flex items-center justify-center shrink-0 cursor-col-resize transition-colors z-20 ${
              activeResizer === 'middle' ? 'bg-blue-500' : 'bg-slate-800 hover:bg-blue-500/80'
            }`}
            title="拖拽调整宽度"
          >
            <button
              onClick={() => setIsMiddleCollapsed(true)}
              className="absolute -left-2 z-30 opacity-0 group-hover:opacity-100 p-0.5 bg-slate-800 hover:bg-blue-600 text-slate-200 rounded border border-slate-700 shadow transition"
              title="折叠收起 Prompt/XML 编辑栏"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-slate-100 flex items-center justify-center">
              <GripVertical className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-900" />
            </div>
          </div>
        )}

        {/* Right Pane (Draw.io Viewport) */}
        <div className="h-full overflow-hidden flex flex-col flex-1 shrink-0 min-w-0">
          {rightPane({
            isWideView,
            onToggleWideView: handleToggleWideView,
          })}
        </div>

        {/* Floating Quick Layout Control Badge Bar */}
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 p-1 bg-slate-900/90 hover:bg-slate-900 text-slate-300 rounded-lg border border-slate-800 shadow-xl text-[11px] backdrop-blur transition">
          <button
            onClick={handleToggleWideView}
            className={`flex items-center gap-1 px-2 py-1 rounded transition ${
              isWideView
                ? 'bg-emerald-600 text-white font-medium shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="极大化流程图画布区域 (收起两侧配置面板)"
          >
            <Maximize2 className="w-3 h-3 text-emerald-400" />
            <span>{isWideView ? '已放大 (95% 宽屏)' : '🔍 宽屏看图模式'}</span>
          </button>

          <div className="w-px h-3 bg-slate-700" />

          <button
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-slate-200"
            title="收起/展开左侧配置面板"
          >
            {isLeftCollapsed ? (
              <PanelLeftOpen className="w-3 h-3 text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-3 h-3" />
            )}
            <span>{isLeftCollapsed ? '展开表单' : '收起表单'}</span>
          </button>

          <button
            onClick={handleResetLayout}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition"
            title="一键重置三栏默认黄金比例"
          >
            <RotateCcw className="w-3 h-3 text-blue-400" />
            <span>复位比例</span>
          </button>
        </div>
      </div>

      {/* Mobile Single Tab View */}
      <div className="flex-1 md:hidden h-full overflow-hidden flex flex-col">
        {mobileTab === 'form' && <div className="h-full overflow-y-auto">{leftPane}</div>}
        {mobileTab === 'editor' && <div className="h-full overflow-y-auto">{middlePane}</div>}
        {mobileTab === 'preview' && (
          <div className="h-full overflow-y-auto">
            {rightPane({ isWideView: false, onToggleWideView: () => {} })}
          </div>
        )}
      </div>
    </div>
  );
};

