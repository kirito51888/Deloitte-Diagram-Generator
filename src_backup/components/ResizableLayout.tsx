import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripVertical, RotateCcw } from 'lucide-react';

interface ResizableLayoutProps {
  leftPane: React.ReactNode;
  middlePane: React.ReactNode;
  rightPane: React.ReactNode;
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
    setLeftWidth(DEFAULT_LEFT_PERCENT);
    setMiddleWidth(DEFAULT_MIDDLE_PERCENT);
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
        // Clamp left panel between 15% and 42%
        const newLeft = Math.min(Math.max(mousePercent, 15), 42);
        setLeftWidth(newLeft);
      } else if (activeResizer === 'middle') {
        // Clamp middle panel based on left width
        const relativePercent = mousePercent - leftWidth;
        const newMiddle = Math.min(Math.max(relativePercent, 15), 45);

        // Ensure right panel gets at least 25%
        if (leftWidth + newMiddle <= 75) {
          setMiddleWidth(newMiddle);
        }
      }
    },
    [activeResizer, leftWidth]
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

  const rightWidth = Math.max(100 - leftWidth - middleWidth, 20);

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
        {/* Fullscreen Transparent Drag Shield to prevent iframe mouse capture */}
        {activeResizer && (
          <div className="fixed inset-0 z-50 cursor-col-resize bg-transparent" />
        )}

        {/* Left Pane */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="h-full overflow-hidden flex flex-col shrink-0"
        >
          {leftPane}
        </div>

        {/* Resizer 1 (between Left & Middle) */}
        <div
          onMouseDown={handleMouseDown('left')}
          onDoubleClick={handleResetLayout}
          className={`w-2.5 hover:w-2.5 group relative flex items-center justify-center shrink-0 cursor-col-resize transition-colors z-20 ${
            activeResizer === 'left' ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-emerald-500/80'
          }`}
          title="拖拽调整左侧宽度 (双击重置默认比例)"
        >
          <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
            <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-slate-900" />
          </div>
        </div>

        {/* Middle Pane */}
        <div
          style={{ width: `${middleWidth}%` }}
          className="h-full overflow-hidden flex flex-col shrink-0"
        >
          {middlePane}
        </div>

        {/* Resizer 2 (between Middle & Right) */}
        <div
          onMouseDown={handleMouseDown('middle')}
          onDoubleClick={handleResetLayout}
          className={`w-2.5 hover:w-2.5 group relative flex items-center justify-center shrink-0 cursor-col-resize transition-colors z-20 ${
            activeResizer === 'middle' ? 'bg-blue-500' : 'bg-slate-800 hover:bg-blue-500/80'
          }`}
          title="拖拽调整中间宽度 (双击重置默认比例)"
        >
          <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
            <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-slate-900" />
          </div>
        </div>

        {/* Right Pane */}
        <div
          style={{ width: `${rightWidth}%` }}
          className="h-full overflow-hidden flex flex-col flex-1 shrink-0"
        >
          {rightPane}
        </div>

        {/* Quick Reset Ratio Floating Badge */}
        {(leftWidth !== DEFAULT_LEFT_PERCENT || middleWidth !== DEFAULT_MIDDLE_PERCENT) && (
          <button
            onClick={handleResetLayout}
            className="absolute bottom-3 left-3 z-30 flex items-center gap-1 px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700 shadow-lg text-[11px] backdrop-blur transition"
            title="一键重置三栏默认黄金比例"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>复位窗格比例 ({Math.round(leftWidth)}% : {Math.round(middleWidth)}% : {Math.round(rightWidth)}%)</span>
          </button>
        )}
      </div>

      {/* Mobile Single Tab View */}
      <div className="flex-1 md:hidden h-full overflow-hidden flex flex-col">
        {mobileTab === 'form' && <div className="h-full overflow-y-auto">{leftPane}</div>}
        {mobileTab === 'editor' && <div className="h-full overflow-y-auto">{middlePane}</div>}
        {mobileTab === 'preview' && <div className="h-full overflow-y-auto">{rightPane}</div>}
      </div>
    </div>
  );
};
