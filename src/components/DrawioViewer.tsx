import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface DrawioViewerProps {
  xmlContent: string;
  onXmlUpdatedFromDrawio?: (newXml: string) => void;
}

export const DrawioViewer: React.FC<DrawioViewerProps> = ({ xmlContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Draw.io embed URL
  const DRAWIO_EMBED_URL = 'https://embed.diagrams.net/?embed=1&proto=json&ui=atlas&spin=1';

  // Sanitize XML to ensure no trailing JS/text or markdown formatting surrounds <mxfile>
  const sanitizeXml = (raw: string): string => {
    if (!raw) return '';
    // Look for <mxfile ... </mxfile> block
    const match = raw.match(/<mxfile[\s\S]*?<\/mxfile>/);
    if (match) return match[0];
    const xmlMatch = raw.match(/<\?xml[\s\S]*?<\/mxfile>/);
    if (xmlMatch) return xmlMatch[0];
    return raw.trim();
  };

  // Send XML to Draw.io iframe via postMessage
  const sendXmlToDrawio = (xml: string) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const cleanXml = sanitizeXml(xml);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ action: 'load', xml: cleanXml }),
        '*'
      );
      setLoadStatus('ready');
    } catch (err) {
      console.error('Failed to postMessage XML to Draw.io:', err);
      setLoadStatus('error');
    }
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

  const handleManualReload = () => {
    setLoadStatus('loading');
    if (iframeRef.current) {
      iframeRef.current.src = DRAWIO_EMBED_URL;
    }
  };

  const handleOpenExternal = () => {
    // Open diagrams.net with data URL or in new tab
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
      <div className="flex items-center justify-between bg-slate-900 px-3 py-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Draw.io 矢量画布预览</span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
            {loadStatus === 'loading' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-400">加载编辑器中...</span>
              </>
            ) : loadStatus === 'ready' ? (
              <>
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">已就绪</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400">通信异常</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sendXmlToDrawio(xmlContent)}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition"
            title="强制刷新渲染当前 XML"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
            <span>刷新图像</span>
          </button>

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition"
            title="在 Draw.io 官方新窗口中打开"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">新窗口打开</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
            title={isFullScreen ? '退出全屏' : '全屏显示'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 relative w-full h-full bg-slate-900 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={DRAWIO_EMBED_URL}
          className="w-full h-full border-none bg-white"
          title="Draw.io Editor"
          allow="geolocation; microphone; camera"
        />
      </div>
    </div>
  );
};
