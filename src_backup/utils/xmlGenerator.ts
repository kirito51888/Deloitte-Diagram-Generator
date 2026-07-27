import { ProcessData } from '../types';

/**
 * Client-side instant Deloitte standard Draw.io XML generator.
 * Converts structured ProcessData into a valid Draw.io XML string.
 */
export function generateDeloitteXmlFromForm(data: ProcessData): string {
  const { pCode, pName, swimlanes } = data;

  const swimlaneHeight = 180;
  const startX = 60;
  const startY = 80;
  const laneWidth = 1800;

  let cellIdCounter = 2;
  const getNextId = () => `cell_${cellIdCounter++}`;

  const cells: string[] = [];

  // Title header cell
  const titleId = getNextId();
  cells.push(`
    <mxCell id="${titleId}" value="${escapeXml(pCode)} ${escapeXml(pName)} 流程图" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#333333;" vertex="1" parent="1">
      <mxGeometry x="${startX}" y="20" width="800" height="40" as="geometry" />
    </mxCell>
  `.trim());

  let currentY = startY;

  // Store activity cell IDs to create connection lines
  const actCellMap: Array<{ id: string; num: string; name: string; x: number; y: number }> = [];

  swimlanes.forEach((lane, laneIdx) => {
    const laneId = getNextId();
    const isFirstLane = laneIdx === 0;

    // Swimlane background container
    cells.push(`
      <mxCell id="${laneId}" value="${escapeXml(lane.name)}" style="swimlane;html=1;horizontal=0;startSize=36;fillColor=#F4F6F8;strokeColor=#D1D5DB;fontColor=#1F2937;fontSize=13;fontStyle=1;collapsible=0;dropTarget=0;" vertex="1" parent="1">
        <mxGeometry x="${startX}" y="${currentY}" width="${laneWidth}" height="${swimlaneHeight}" as="geometry" />
      </mxCell>
    `.trim());

    let currentX = 100;

    // First lane start node
    if (isFirstLane) {
      const startNodeId = getNextId();
      cells.push(`
        <mxCell id="${startNodeId}" value="开始" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#86BC25;strokeColor=#6B971D;fontColor=#FFFFFF;fontStyle=1;fontSize=11;" vertex="1" parent="${laneId}">
          <mxGeometry x="${currentX}" y="${Math.floor(swimlaneHeight / 2 - 20)}" width="40" height="40" as="geometry" />
        </mxCell>
      `.trim());
      actCellMap.push({ id: startNodeId, num: 'START', name: '开始', x: currentX, y: currentY + swimlaneHeight / 2 });
      currentX += 80;
    }

    // Render activities in this swimlane
    lane.acts.forEach((act) => {
      const actId = getNextId();
      const actWidth = 140;
      const actHeight = 60;
      const actY = Math.floor(swimlaneHeight / 2 - actHeight / 2);

      // Label with number and name
      const label = `<b>${escapeXml(act.num)}</b><br/>${escapeXml(act.name)}`;

      // Main Activity Box
      cells.push(`
        <mxCell id="${actId}" value="${label}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#111827;fontSize=11;align=center;verticalAlign=middle;" vertex="1" parent="${laneId}">
          <mxGeometry x="${currentX}" y="${actY}" width="${actWidth}" height="${actHeight}" as="geometry" />
        </mxCell>
      `.trim());

      actCellMap.push({
        id: actId,
        num: act.num,
        name: act.name,
        x: currentX,
        y: currentY + actY + actHeight / 2,
      });

      // Render Systems badge if available
      if (act.sys && act.sys.length > 0) {
        const sysId = getNextId();
        const sysLabel = act.sys.map(escapeXml).join(' / ');
        cells.push(`
          <mxCell id="${sysId}" value="${sysLabel}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#EFF6FF;strokeColor=#3B82F6;fontColor=#1E40AF;fontSize=9;align=center;" vertex="1" parent="${laneId}">
            <mxGeometry x="${currentX}" y="${actY - 22}" width="${actWidth}" height="18" as="geometry" />
          </mxCell>
        `.trim());
      }

      // Render Input Documents if available
      if (act.docInp && act.docInp.length > 0) {
        const docInpId = getNextId();
        const docInpLabel = act.docInp.map((d) => `《${escapeXml(d)}》`).join('\n');
        cells.push(`
          <mxCell id="${docInpId}" value="${docInpLabel}" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#FEF3C7;strokeColor=#F59E0B;fontColor=#92400E;fontSize=9;align=center;size=10;" vertex="1" parent="${laneId}">
            <mxGeometry x="${currentX - 10}" y="${actY + actHeight + 8}" width="${actWidth / 2 + 10}" height="32" as="geometry" />
          </mxCell>
        `.trim());
      }

      // Render Output Documents if available
      if (act.docOut && act.docOut.length > 0) {
        const docOutId = getNextId();
        const docOutLabel = act.docOut.map((d) => `《${escapeXml(d)}》`).join('\n');
        cells.push(`
          <mxCell id="${docOutId}" value="${docOutLabel}" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#ECFDF5;strokeColor=#10B981;fontColor=#065F46;fontSize=9;align=center;size=10;" vertex="1" parent="${laneId}">
            <mxGeometry x="${currentX + actWidth / 2}" y="${actY + actHeight + 8}" width="${actWidth / 2 + 10}" height="32" as="geometry" />
          </mxCell>
        `.trim());
      }

      currentX += 200;
    });

    // Last lane end node if first lane had start
    if (isFirstLane && lane.acts.length > 0) {
      const endNodeId = getNextId();
      cells.push(`
        <mxCell id="${endNodeId}" value="结束" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#EF4444;strokeColor=#DC2626;fontColor=#FFFFFF;fontStyle=1;fontSize=11;" vertex="1" parent="${laneId}">
          <mxGeometry x="${currentX}" y="${Math.floor(swimlaneHeight / 2 - 20)}" width="40" height="40" as="geometry" />
        </mxCell>
      `.trim());
      actCellMap.push({ id: endNodeId, num: 'END', name: '结束', x: currentX, y: currentY + swimlaneHeight / 2 });
    }

    currentY += swimlaneHeight + 20;
  });

  // Connect activities in sequential order
  for (let i = 0; i < actCellMap.length - 1; i++) {
    const source = actCellMap[i];
    const target = actCellMap[i + 1];
    const edgeId = getNextId();

    cells.push(`
      <mxCell id="${edgeId}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#4B5563;strokeWidth=1.5;endArrow=classic;endSize=6;" edge="1" parent="1" source="${source.id}" target="${target.id}">
        <mxGeometry relative="1" as="geometry" />
      </mxCell>
    `.trim());
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram name="${escapeXml(pName)}流程图" id="deloitte_diagram_gen">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1920" pageHeight="1080" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`.trim();
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats process information into standard markdown string for AI Prompt
 */
export function generateProcessInfoText(data: ProcessData): string {
  const { pCode, pName, swimlanes } = data;

  let allActsCount = 0;
  swimlanes.forEach((sl) => {
    allActsCount += sl.acts.length;
  });

  let text = `### 流程信息\n`;
  text += `- 流程名称：${pName}\n`;
  text += `- 版本/编号：${pCode}\n`;
  text += `- 画布尺寸：1920 x 1080\n\n`;

  text += `### 角色与泳道（${swimlanes.length}个）\n`;
  swimlanes.forEach((sl, i) => {
    const note = i === 0 ? '（第一泳道，包含开始和结束节点）' : '';
    text += `- lane${i + 1}：${sl.name}${note}\n`;
  });

  text += `\n### 活动清单（按流程顺序，共${allActsCount}个步骤）\n`;

  swimlanes.forEach((sl, slIdx) => {
    sl.acts.forEach((act) => {
      let details = `（lane${slIdx + 1}: ${sl.name}）`;
      if (act.sys && act.sys.length > 0) details += ` | 系统：${act.sys.join('、')}`;
      if (act.docInp && act.docInp.length > 0) details += ` | 输入：${act.docInp.map((d) => `《${d}》`).join('、')}`;
      if (act.docOut && act.docOut.length > 0) details += ` | 输出：${act.docOut.map((d) => `《${d}》`).join('、')}`;
      text += `${act.num} ${act.name} ${details}\n`;
    });
  });

  text += `\n### 连接关系\n`;
  text += `start → `;
  const actNums: string[] = [];
  swimlanes.forEach((sl) => {
    sl.acts.forEach((act) => actNums.push(act.num));
  });
  text += actNums.join(' → ') + ` → end\n`;
  text += `（如有决策分支，例如 Yes/No，请在相应决策节点后分流）`;

  return text;
}
