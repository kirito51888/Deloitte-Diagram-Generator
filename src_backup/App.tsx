import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FormConfigurator } from './components/FormConfigurator';
import { XmlEditorPanel } from './components/XmlEditorPanel';
import { DrawioViewer } from './components/DrawioViewer';
import { DeloitteSpecsModal } from './components/DeloitteSpecsModal';
import { SettingsModal } from './components/SettingsModal';
import { ResizableLayout } from './components/ResizableLayout';

import { FORM_TEMPLATES } from './data/formTemplates';
import { XML_TEMPLATES } from './data/xmlTemplates';
import { ProcessData, AiConfig } from './types';
import {
  generateDeloitteXmlFromForm,
  generateProcessInfoText,
} from './utils/xmlGenerator';

export default function App() {
  const defaultKey = 'pig-transfer';
  const initialForm = FORM_TEMPLATES[defaultKey] || {
    pCode: '4.2',
    pName: '断奶仔猪转群',
    swimlanes: [],
  };

  const [processData, setProcessData] = useState<ProcessData>(initialForm);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(defaultKey);
  const [xmlContent, setXmlContent] = useState<string>(
    XML_TEMPLATES[defaultKey] && XML_TEMPLATES[defaultKey].includes('</mxfile>')
      ? XML_TEMPLATES[defaultKey]
      : generateDeloitteXmlFromForm(initialForm)
  );
  const [processInfoText, setProcessInfoText] = useState<string>(
    generateProcessInfoText(initialForm)
  );

  const [aiConfig, setAiConfig] = useState<AiConfig>({
    model: 'gemini-3.6-flash',
    temperature: 0.3,
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [statusText, setStatusText] = useState<string>('已加载德勤预设流程');

  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync process info text when processData changes
  const handleProcessDataChange = (newData: ProcessData) => {
    setProcessData(newData);
    setProcessInfoText(generateProcessInfoText(newData));
  };

  // Handle preset selection
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    if (!key || key === 'custom') {
      const emptyForm: ProcessData = {
        pCode: '1.0',
        pName: '自定义空白流程',
        swimlanes: [
          {
            id: 'lane_1',
            name: '主部门',
            acts: [
              {
                id: 'act_1',
                num: '01',
                name: '初始步骤',
                sys: [],
                docInp: [],
                docOut: [],
              },
            ],
          },
        ],
      };
      setProcessData(emptyForm);
      setProcessInfoText(generateProcessInfoText(emptyForm));
      const newXml = generateDeloitteXmlFromForm(emptyForm);
      setXmlContent(newXml);
      setStatusText('已新建空白流程');
      return;
    }

    if (FORM_TEMPLATES[key]) {
      const templateData = JSON.parse(JSON.stringify(FORM_TEMPLATES[key]));
      setProcessData(templateData);
      setProcessInfoText(generateProcessInfoText(templateData));

      // Always fallback to generateDeloitteXmlFromForm if XML_TEMPLATES[key] is missing or incomplete
      const generatedXml = generateDeloitteXmlFromForm(templateData);
      const presetXml = XML_TEMPLATES[key];
      const validXml =
        presetXml && presetXml.includes('</mxfile>') ? presetXml : generatedXml;

      setXmlContent(validXml);
      setStatusText('已加载预设流程与 XML');
    }
  };

  // Sync process info text button
  const handleSyncProcessInfoText = () => {
    const text = generateProcessInfoText(processData);
    setProcessInfoText(text);
    setStatusText('已同步表单到文本框');
  };

  // Instant generate XML directly from form
  const handleInstantGenerate = () => {
    const xml = generateDeloitteXmlFromForm(processData);
    setXmlContent(xml);
    setStatusText('已根据表单算法生成');
  };

  // AI generate Draw.io XML
  const handleAiGenerate = async () => {
    if (!processInfoText.trim()) {
      alert('请输入或从表单生成流程信息文本');
      return;
    }

    setIsAiGenerating(true);
    setStatusText('AI 正在推理构建 XML...');

    try {
      const response = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processInfo: processInfoText,
          apiKey: aiConfig.apiKey,
          mimoApiKey: aiConfig.mimoApiKey,
          modelName: aiConfig.model,
          temperature: aiConfig.temperature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 流程图生成失败');
      }

      if (data.xml) {
        setXmlContent(data.xml);
        setStatusText(`AI 智能生成完成 (${aiConfig.model})`);
      } else {
        throw new Error('AI 未能返回有效的 XML 代码');
      }
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      alert(`AI 生成失败: ${err.message}`);
      setStatusText('生成失败');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Download .drawio file
  const handleDownload = () => {
    if (!xmlContent) {
      alert('无可用的 XML 内容');
      return;
    }
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${processData.pCode || 'process'}_${processData.pName || 'diagram'}.drawio`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy XML to clipboard
  const handleCopy = () => {
    if (!xmlContent) return;
    navigator.clipboard.writeText(xmlContent);
    setStatusText('XML 已复制到剪贴板');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      {/* App Header */}
      <Header
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onInstantGenerate={handleInstantGenerate}
        onAiGenerate={handleAiGenerate}
        isAiGenerating={isAiGenerating}
        onDownload={handleDownload}
        onCopy={handleCopy}
        pName={processData.pName}
        pCode={processData.pCode}
      />

      {/* Main Workspace 3-Panel Resizable Layout */}
      <ResizableLayout
        leftPane={
          <FormConfigurator
            data={processData}
            onChange={handleProcessDataChange}
            onSelectPreset={handleSelectPreset}
            selectedPresetKey={selectedPresetKey}
            onSyncProcessInfoText={handleSyncProcessInfoText}
          />
        }
        middlePane={
          <XmlEditorPanel
            processInfoText={processInfoText}
            onProcessInfoChange={setProcessInfoText}
            xmlContent={xmlContent}
            onXmlChange={setXmlContent}
            onLoadXmlToDrawio={() => setStatusText('已更新到画布')}
            onAiGenerate={handleAiGenerate}
            isAiGenerating={isAiGenerating}
            statusText={statusText}
          />
        }
        rightPane={<DrawioViewer xmlContent={xmlContent} />}
      />

      {/* Modals */}
      <DeloitteSpecsModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={aiConfig}
        onChangeConfig={setAiConfig}
      />
    </div>
  );
}
