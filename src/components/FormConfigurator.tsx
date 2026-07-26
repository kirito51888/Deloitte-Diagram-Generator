import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
  Monitor,
  CheckCircle2,
  ListFilter,
  Sparkles,
  RefreshCw,
  FolderInput,
  FolderOutput,
} from 'lucide-react';
import { ProcessData, Swimlane, Activity } from '../types';

interface FormConfiguratorProps {
  data: ProcessData;
  onChange: (newData: ProcessData) => void;
  onSelectPreset: (key: string) => void;
  selectedPresetKey: string;
  onSyncProcessInfoText: () => void;
}

export const FormConfigurator: React.FC<FormConfiguratorProps> = ({
  data,
  onChange,
  onSelectPreset,
  selectedPresetKey,
  onSyncProcessInfoText,
}) => {
  const [expandedLanes, setExpandedLanes] = useState<Record<string, boolean>>({
    lane1: true,
    lane2: true,
  });

  const [expandedActs, setExpandedActs] = useState<Record<string, boolean>>({});
  const [newRoleName, setNewRoleName] = useState('');

  const toggleLane = (id: string) => {
    setExpandedLanes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAct = (id: string) => {
    setExpandedActs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add new swimlane
  const handleAddSwimlane = () => {
    if (!newRoleName.trim()) return;
    const newLaneId = `lane_${Date.now()}`;
    const newSwimlanes: Swimlane[] = [
      ...data.swimlanes,
      {
        id: newLaneId,
        name: newRoleName.trim(),
        acts: [],
      },
    ];
    onChange({ ...data, swimlanes: newSwimlanes });
    setNewRoleName('');
    setExpandedLanes((prev) => ({ ...prev, [newLaneId]: true }));
  };

  // Remove swimlane
  const handleRemoveSwimlane = (laneId: string) => {
    if (data.swimlanes.length <= 1) {
      alert('至少需要保留一个角色泳道');
      return;
    }
    const newSwimlanes = data.swimlanes.filter((l) => l.id !== laneId);
    onChange({ ...data, swimlanes: newSwimlanes });
  };

  // Update swimlane name
  const handleSwimlaneNameChange = (laneId: string, name: string) => {
    const newSwimlanes = data.swimlanes.map((l) => (l.id === laneId ? { ...l, name } : l));
    onChange({ ...data, swimlanes: newSwimlanes });
  };

  // Add activity to swimlane
  const handleAddActivity = (laneId: string) => {
    let maxNum = 0;
    data.swimlanes.forEach((sl) => {
      sl.acts.forEach((a) => {
        const parsed = parseInt(a.num.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
      });
    });

    const nextNumStr = (maxNum + 1).toString().padStart(2, '0');
    const newActId = `act_${Date.now()}`;

    const newActivity: Activity = {
      id: newActId,
      num: nextNumStr,
      name: '新流程活动步骤',
      sys: [],
      docInp: [],
      docOut: [],
    };

    const newSwimlanes = data.swimlanes.map((sl) =>
      sl.id === laneId ? { ...sl, acts: [...sl.acts, newActivity] } : sl
    );

    onChange({ ...data, swimlanes: newSwimlanes });
    setExpandedActs((prev) => ({ ...prev, [newActId]: true }));
  };

  // Remove activity
  const handleRemoveActivity = (laneId: string, actId: string) => {
    const newSwimlanes = data.swimlanes.map((sl) =>
      sl.id === laneId ? { ...sl, acts: sl.acts.filter((a) => a.id !== actId) } : sl
    );
    onChange({ ...data, swimlanes: newSwimlanes });
  };

  // Update activity property
  const handleUpdateActivity = (actId: string, field: keyof Activity, val: any) => {
    const newSwimlanes = data.swimlanes.map((sl) => ({
      ...sl,
      acts: sl.acts.map((a) => (a.id === actId ? { ...a, [field]: val } : a)),
    }));
    onChange({ ...data, swimlanes: newSwimlanes });
  };

  // Tag helper
  const handleAddTag = (actId: string, field: 'sys' | 'docInp' | 'docOut') => {
    const label = prompt(
      field === 'sys' ? '请输入涉及的系统名称 (如: ERP, MES):' : '请输入关联文档名称:'
    );
    if (!label || !label.trim()) return;

    const newSwimlanes = data.swimlanes.map((sl) => ({
      ...sl,
      acts: sl.acts.map((a) => {
        if (a.id === actId) {
          const currentList = a[field] || [];
          if (currentList.includes(label.trim())) return a;
          return { ...a, [field]: [...currentList, label.trim()] };
        }
        return a;
      }),
    }));
    onChange({ ...data, swimlanes: newSwimlanes });
  };

  const handleRemoveTag = (
    actId: string,
    field: 'sys' | 'docInp' | 'docOut',
    tagToRemove: string
  ) => {
    const newSwimlanes = data.swimlanes.map((sl) => ({
      ...sl,
      acts: sl.acts.map((a) => {
        if (a.id === actId) {
          return { ...a, [field]: (a[field] || []).filter((t) => t !== tagToRemove) };
        }
        return a;
      }),
    }));
    onChange({ ...data, swimlanes: newSwimlanes });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 overflow-y-auto p-4 space-y-4 text-xs">
      {/* Top Presets Section */}
      <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80 space-y-2">
        <label className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
          <ListFilter className="w-4 h-4" />
          <span>选择标准流程模板 (快速预设)</span>
        </label>
        <select
          value={selectedPresetKey}
          onChange={(e) => onSelectPreset(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="">-- 选择预设流程 --</option>
          <option value="pig-transfer">断奶仔猪转群（6泳道·8步骤·2决策点）</option>
          <option value="purchase-exec">采购执行（4泳道·7步骤·1决策点）</option>
          <option value="payment-approval">付款审批（3泳道·6步骤·2决策点）</option>
          <option value="inventory-mgmt">库存管理（5泳道·8步骤·2决策点）</option>
          <option value="custom">自定义空白流程</option>
        </select>
      </div>

      {/* Process Basic Details */}
      <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">流程编号</label>
          <input
            type="text"
            value={data.pCode}
            onChange={(e) => onChange({ ...data, pCode: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            placeholder="例如: 4.2"
          />
        </div>
        <div className="col-span-2">
          <label className="text-slate-400 block mb-1 font-medium">流程名称</label>
          <input
            type="text"
            value={data.pName}
            onChange={(e) => onChange({ ...data, pName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-medium text-xs focus:outline-none focus:border-emerald-500"
            placeholder="例如: 断奶仔猪转群流程"
          />
        </div>
      </div>

      {/* Add New Swimlane */}
      <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">角色与泳道管理</span>
          <button
            onClick={onSyncProcessInfoText}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
          >
            <RefreshCw className="w-3 h-3" />
            <span>同步文本框</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="输入新角色名称 (如: 兽医/财务)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddSwimlane()}
          />
          <button
            onClick={handleAddSwimlane}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加泳道</span>
          </button>
        </div>
      </div>

      {/* Swimlane List */}
      <div className="space-y-3 flex-1">
        {data.swimlanes.map((lane, laneIdx) => {
          const isLaneExpanded = expandedLanes[lane.id] !== false;

          return (
            <div
              key={lane.id}
              className="bg-slate-800/70 border border-slate-700/80 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Lane Header */}
              <div
                onClick={() => toggleLane(lane.id)}
                className="flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-750 cursor-pointer select-none border-b border-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/30">
                    {laneIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={lane.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleSwimlaneNameChange(lane.id, e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-emerald-500 focus:bg-slate-950 text-slate-200 font-semibold text-xs px-1 py-0.5 rounded focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    ({lane.acts.length} 个步骤)
                  </span>
                  {laneIdx === 0 && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      主泳道(含Start/End)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddActivity(lane.id);
                    }}
                    className="p-1 hover:bg-slate-700 text-slate-300 rounded transition"
                    title="在此泳道增加步骤"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSwimlane(lane.id);
                    }}
                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition"
                    title="删除该泳道"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isLaneExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Lane Activities List */}
              {isLaneExpanded && (
                <div className="p-2 space-y-2 bg-slate-900/60">
                  {lane.acts.length === 0 ? (
                    <div className="text-center py-3 text-slate-500 text-[11px] border border-dashed border-slate-800 rounded">
                      暂无活动步骤，点击右上角 + 按钮添加
                    </div>
                  ) : (
                    lane.acts.map((act) => {
                      const isActExpanded = expandedActs[act.id] !== false;

                      return (
                        <div
                          key={act.id}
                          className="bg-slate-950/80 border border-slate-800 rounded-md overflow-hidden"
                        >
                          {/* Activity Item Bar */}
                          <div
                            onClick={() => toggleAct(act.id)}
                            className="flex items-center justify-between p-2 hover:bg-slate-800/50 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                type="text"
                                value={act.num}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  handleUpdateActivity(act.id, 'num', e.target.value)
                                }
                                className="w-12 bg-slate-900 border border-emerald-500/30 rounded px-1 text-center font-bold text-emerald-400 focus:outline-none focus:border-emerald-400 text-xs"
                                title="步骤编号"
                              />
                              <input
                                type="text"
                                value={act.name}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  handleUpdateActivity(act.id, 'name', e.target.value)
                                }
                                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-slate-200 font-medium text-xs focus:bg-slate-900 px-1 focus:outline-none truncate"
                                placeholder="活动名称"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 ml-2">
                              {/* Tags preview */}
                              {act.sys?.length > 0 && (
                                <span className="bg-blue-500/10 text-blue-400 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/20">
                                  {act.sys.length}系统
                                </span>
                              )}
                              {(act.docInp?.length > 0 || act.docOut?.length > 0) && (
                                <span className="bg-amber-500/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/20">
                                  {(act.docInp?.length || 0) + (act.docOut?.length || 0)}文档
                                </span>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveActivity(lane.id, act.id);
                                }}
                                className="text-slate-500 hover:text-red-400 p-0.5 transition"
                                title="删除步骤"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded details (Systems, Input & Output Docs) */}
                          {isActExpanded && (
                            <div className="p-2 pt-0 border-t border-slate-800/80 space-y-2 mt-1">
                              {/* System Tags */}
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span className="flex items-center gap-1">
                                    <Monitor className="w-3 h-3 text-blue-400" />
                                    <span>关联系统软件</span>
                                  </span>
                                  <button
                                    onClick={() => handleAddTag(act.id, 'sys')}
                                    className="text-blue-400 hover:underline"
                                  >
                                    + 添加系统
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {act.sys?.map((s) => (
                                    <span
                                      key={s}
                                      className="bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                                    >
                                      {s}
                                      <button
                                        onClick={() => handleRemoveTag(act.id, 'sys', s)}
                                        className="hover:text-red-400 font-bold ml-0.5"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  {(!act.sys || act.sys.length === 0) && (
                                    <span className="text-[10px] text-slate-600 italic">
                                      无关联系统
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Input Documents */}
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span className="flex items-center gap-1">
                                    <FolderInput className="w-3 h-3 text-amber-400" />
                                    <span>输入表单文档</span>
                                  </span>
                                  <button
                                    onClick={() => handleAddTag(act.id, 'docInp')}
                                    className="text-amber-400 hover:underline"
                                  >
                                    + 添加输入文档
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {act.docInp?.map((d) => (
                                    <span
                                      key={d}
                                      className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                                    >
                                      《{d}》
                                      <button
                                        onClick={() => handleRemoveTag(act.id, 'docInp', d)}
                                        className="hover:text-red-400 font-bold ml-0.5"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  {(!act.docInp || act.docInp.length === 0) && (
                                    <span className="text-[10px] text-slate-600 italic">
                                      无输入文档
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Output Documents */}
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span className="flex items-center gap-1">
                                    <FolderOutput className="w-3 h-3 text-emerald-400" />
                                    <span>输出结果表单</span>
                                  </span>
                                  <button
                                    onClick={() => handleAddTag(act.id, 'docOut')}
                                    className="text-emerald-400 hover:underline"
                                  >
                                    + 添加输出文档
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {act.docOut?.map((d) => (
                                    <span
                                      key={d}
                                      className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                                    >
                                      《{d}》
                                      <button
                                        onClick={() => handleRemoveTag(act.id, 'docOut', d)}
                                        className="hover:text-red-400 font-bold ml-0.5"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  {(!act.docOut || act.docOut.length === 0) && (
                                    <span className="text-[10px] text-slate-600 italic">
                                      无输出文档
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
