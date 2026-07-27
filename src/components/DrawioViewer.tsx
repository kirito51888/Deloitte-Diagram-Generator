import React, { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Layout,
  ZoomIn,
  Sparkles,
} from 'lucide-react';

interface DrawioViewerProps {
  xmlContent: string;
  onXmlUpdatedFromDrawio?: (newXml: string) => void;
  isWideView?: boolean;
  onToggleWideView?: () => void;
}

export const DrawioViewer: React.FC<DrawioViewerProps> = ({
  xmlContent,
  isWideView,
  onToggleWideView,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Draw.io embed UI Mode: 'min' (clean large canvas, no sidebars) vs 'atlas' (full shape sidebars)
  const [uiMode, setUiMode] = useState<'min' | 'atlas'>('min');

  // Draw.io embed URL constructor
  const getDrawioUrl = (mode: 'min' | 'atlas') => {
    return `https://embed.diagrams.net/?embed=1&proto=json&ui=${mode}&spin=1&modified=1&libraries=0`;
  };

  const [iframeUrl, setIframeUrl] = useState(() => getDrawioUrl('min'));

  // Sanitize XML to ensure no trailing JS/text or markdown formatting surrounds <mxfile>
  const sanitizeXml = (raw: string): string => {
    if (!raw) return '';
    const match = raw.match(/<mxfile[\s\S]*?<\/mxfile>/);
    if (match) return match[0];
    const xmlMatch = raw.match(/<\?xml[\s\S]*?<\/mxfile>/);
    if (xmlMatch) return xmlMatch[0];
    return raw.trim();
  };

  // Send XML to Draw.io iframe via postMessage with fit: true
  const sendXmlToDrawio = (xml: string) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const cleanXml = sanitizeXml(xml);
      // Pass fit: true to auto-fit the diagram inside the canvas
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ action: 'load', xml: cleanXml, fit: true }),
        '*'
      );
      setLoadStatus('ready');
    } catch (err) {
      console.error('Failed to postMessage XML to Draw.io:', err);
      setLoadStatus('error');
    }
  };

  // Auto-fit diagram zoom
  const handleAutoFit = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ action: 'fit' }),
        '*'
      );
    } catch (err) {
      console.error('Fit action failed:', err);
    }
  };

  // Switch UI Mode (min vs atlas)
  const handleToggleUiMode = (newMode: 'min' | 'atlas') => {
    if (newMode === uiMode) return;
    setUiMode(newMode);
    setIsReady(false);
    setLoadStatus('loading');
    setIframeUrl(getDrawioUrl(newMode));
  };

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data && data.event === 'init') {
          setIsReady(true);
          setLoadStatus('ready');
          if (xmlContent) {
            sendXmlToDrawio(xmlContent);
          }
        }
      } catch (e) {
        // Ignore non-json window messages
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [xmlContent]);

  // When xmlContent prop updates, auto-sync to Draw.io if ready
  useEffect(() => {
    if (isReady && xmlContent) {
      sendXmlToDrawio(xmlContent);
    }
  }, [xmlContent, isReady]);

  const handleOpenExternal = () => {
    const url = 'https://app.diagrams.net/';
    window.open(url, '_blank');
  };

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 border-l border-slate-800 ${
        isFullScreen ? 'fixed inset-0 z-50 bg-slate-950' : 'relative'
      }`}
    >
      {/* Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 px-3 py-2 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Draw.io 画布</span>
          </span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
            {loadStatus === 'loading' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-400">加载中...</span>
              </>
            ) : loadStatus === 'ready' ? (
              <>
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">就绪</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400">异常</span>
              </>
            )}
          </div>

          {/* UI Mode Switcher (Minimizes Draw.io sidebars for maximum canvas space) */}
          <div className="hidden lg:flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800 text-[11px]">
            <button
              onClick={() => handleToggleUiMode('min')}
              className={`px-2 py-0.5 rounded transition ${
                uiMode === 'min'
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="隐藏左侧/右侧图形面板，留出最大画布区域"
            >
              精简大画布
            </button>
            <button
              onClick={() => handleToggleUiMode('atlas')}
              className={`px-2 py-0.5 rounded transition ${
                uiMode === 'atlas'
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="显示完整的 Draw.io 图形侧边工具栏"
            >
              完整编辑器
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Wide Layout View if provided */}
          {onToggleWideView && (
            <button
              onClick={onToggleWideView}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition text-[11px] ${
                isWideView
                  ? 'bg-emerald-600 text-white border-emerald-500 font-medium'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isWideView ? '恢复三栏并列布局' : '展开为 90%+ 宽屏大图画布'}
            >
              <Layout className="w-3 h-3 text-emerald-400" />
              <span>{isWideView ? '恢复三栏' : '🔍 宽屏大图'}</span>
            </button>
          )}

          {/* Auto fit canvas */}
          <button
            onClick={handleAutoFit}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 transition text-[11px]"
            title="居中适应缩放，使流程图填满当前画布"
          >
            <ZoomIn className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">适应画布</span>
          </button>

          {/* Refresh image */}
          <button
            onClick={() => sendXmlToDrawio(xmlContent)}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 transition text-[11px]"
            title="重新填充加载当前 XML 代码"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
            <span className="hidden md:inline">重载</span>
          </button>

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 transition text-[11px]"
            title="在新标签页中打开官方 Draw.io"
          >
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
            title={isFullScreen ? '退出全屏模式' : '全屏网页最大化'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 relative w-full h-full bg-slate-900 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-none bg-white"
          title="Draw.io Editor"
          allow="geolocation; microphone; camera"
        />
      </div>
    </div>
  );
};

