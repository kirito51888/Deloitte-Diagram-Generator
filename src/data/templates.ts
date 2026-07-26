export const FORM_TEMPLATES = {
  'pig-transfer': {
    code: '4.2',
    name: '断奶仔猪转群流程',
    swimlanes: [
      {id:'s1',name:'流程驱动',acts:[{id:'a1',num:'01',name:'断奶计划制定',sys:['养殖管理系统'],docInp:[],docOut:['断奶计划表']}]},
      {id:'s2',name:'产房',acts:[{id:'a3',num:'03',name:'转群批次确认',sys:[],docInp:[],docOut:['转群批次单']}]},
      {id:'s3',name:'保育舍',acts:[{id:'a5',num:'05',name:'转入保育舍',sys:[],docInp:[],docOut:[]}]},
      {id:'s4',name:'兽医',acts:[{id:'a2',num:'02',name:'仔猪健康评估',sys:[],docInp:[],docOut:['健康评估报告']},{id:'a7',num:'07',name:'隔离观察处理',sys:[],docInp:[],docOut:['隔离观察记录']}]},
      {id:'s5',name:'饲养员',acts:[{id:'a4',num:'04',name:'转群操作执行',sys:[],docInp:[],docOut:[]}]},
      {id:'s6',name:'统计员',acts:[{id:'a6',num:'06',name:'转群记录',sys:[],docInp:[],docOut:['转群记录表']},{id:'a8',num:'08',name:'转群数据统计',sys:['数据分析系统'],docInp:[],docOut:['转群统计报表']}]}
    ],
    info: `### 流程信息
- 流程名称：断奶仔猪转群流程
- 版本号：4.2
- 画布尺寸：1920 x 1080

### 角色与泳道（6个）
- lane1：流程驱动（第一泳道，包含开始和结束）
- lane2：产房
- lane3：保育舍
- lane4：兽医
- lane5：饲养员
- lane6：统计员

### 活动清单（按流程顺序）
01 断奶计划制定（lane1）| 系统：养殖管理系统 | 输出：《断奶计划表》
02 仔猪健康评估（lane4）| 输出：《健康评估报告》
03 转群批次确认（lane2）| 输出：《转群批次单》
04 转群操作执行（lane5）
05 转入保育舍（lane3）
06 转群记录（lane6）| 输出：《转群记录表》
07 隔离观察处理（lane4）| 输出：《隔离观察记录》
08 转群数据统计（lane6）| 系统：数据分析系统 | 输出：《转群统计报表》

### 决策点（2个）
- decision01：是否达到转群标准？| Yes → step04（转群操作执行）| No → 返回 step02（仔猪健康评估）
- decision02：是否需要隔离观察？| Yes → step07（隔离观察处理）| No → step06（转群记录）

### 连接关系
start → step01 → step02 → step03 → decision01
decision01 -[是]→ step04 → step05 → decision02
decision01 -[否]→ step02（返回）
decision02 -[是]→ step07 → step06
decision02 -[否]→ step06
step06 → step08 → end`
  },

  'purchase-exec': {
    code: '5.1',
    name: '采购执行流程',
    swimlanes: [
      {id:'s1',name:'流程驱动',acts:[{id:'a2',num:'02',name:'价格审核',sys:['财务系统'],docInp:[],docOut:[]}]},
      {id:'s2',name:'采购部门',acts:[{id:'a1',num:'01',name:'采购订单确认',sys:['ERP系统'],docInp:[],docOut:['采购订单']}]},
      {id:'s3',name:'供应商',acts:[{id:'a3',num:'03',name:'订单执行',sys:[],docInp:[],docOut:[]},{id:'a4',num:'04',name:'发货通知',sys:[],docInp:[],docOut:['发货通知单']}]},
      {id:'s4',name:'仓储部门',acts:[{id:'a5',num:'05',name:'收货验收',sys:['WMS系统'],docInp:[],docOut:['验收单']},{id:'a6',num:'06',name:'质量检验',sys:[],docInp:[],docOut:['质检报告']},{id:'a7',num:'07',name:'入库上架',sys:['WMS系统'],docInp:[],docOut:['入库单']}]}
    ],
    info: `### 流程信息
- 流程名称：采购执行流程
- 版本号：5.1
- 画布尺寸：1920 x 1080

### 角色与泳道（4个）
- lane1：流程驱动（第一泳道，包含开始和结束）
- lane2：采购部门
- lane3：供应商
- lane4：仓储部门

### 活动清单（按流程顺序）
01 采购订单确认（lane2）| 系统：ERP系统 | 输出：《采购订单》
02 价格审核（lane1）| 系统：财务系统
03 订单执行（lane3）
04 发货通知（lane3）| 输出：《发货通知单》
05 收货验收（lane4）| 系统：WMS系统 | 输出：《验收单》
06 质量检验（lane4）| 输出：《质检报告》
07 入库上架（lane4）| 系统：WMS系统 | 输出：《入库单》

### 决策点（1个）
- decision01：是否按时交付？| Yes → step04（发货通知）| No → 返回 step03（订单执行）

### 连接关系
start → step01 → step02 → step03 → decision01
decision01 -[是]→ step04 → step05 → step06 → step07 → end
decision01 -[否]→ step03（返回）`
  },

  'payment-approval': {
    code: '6.1',
    name: '付款审批流程',
    swimlanes: [
      {id:'s1',name:'流程驱动',acts:[{id:'a1',num:'01',name:'付款申请提交',sys:['财务系统'],docInp:[],docOut:['付款申请单']}]},
      {id:'s2',name:'财务部门',acts:[{id:'a2',num:'02',name:'发票审核',sys:['财务系统'],docInp:[],docOut:[]},{id:'a3',num:'03',name:'部门审批',sys:[],docInp:[],docOut:[]},{id:'a5',num:'05',name:'付款执行',sys:['银行系统'],docInp:[],docOut:[]},{id:'a6',num:'06',name:'付款凭证归档',sys:[],docInp:[],docOut:['付款凭证']}]},
      {id:'s3',name:'管理层',acts:[{id:'a4',num:'04',name:'管理层审批',sys:[],docInp:[],docOut:[]}]}
    ],
    info: `### 流程信息
- 流程名称：付款审批流程
- 版本号：6.1
- 画布尺寸：1920 x 1080

### 角色与泳道（3个）
- lane1：流程驱动（第一泳道，包含开始和结束）
- lane2：财务部门
- lane3：管理层

### 活动清单（按流程顺序）
01 付款申请提交（lane1）| 系统：财务系统 | 输出：《付款申请单》
02 发票审核（lane2）| 系统：财务系统
03 部门审批（lane2）
04 管理层审批（lane3）
05 付款执行（lane2）| 系统：银行系统
06 付款凭证归档（lane2）| 输出：《付款凭证》

### 决策点（2个）
- decision01：发票是否合规？| Yes → step03（部门审批）| No → 返回 step02（发票审核）
- decision02：审批是否通过？| Yes → step05（付款执行）| No → 返回 step03（部门审批）

### 连接关系
start → step01 → step02 → decision01
decision01 -[是]→ step03 → step04 → decision02
decision01 -[否]→ step02（返回）
decision02 -[是]→ step05 → step06 → end
decision02 -[否]→ step03（返回）`
  },

  'inventory-mgmt': {
    code: '7.1',
    name: '库存管理流程',
    swimlanes: [
      {id:'s1',name:'流程驱动',acts:[]},
      {id:'s2',name:'仓储部门',acts:[{id:'a1',num:'01',name:'库存盘点',sys:['WMS系统'],docInp:[],docOut:['盘点表']},{id:'a2',num:'02',name:'差异分析',sys:[],docInp:[],docOut:['差异分析报告']},{id:'a4',num:'04',name:'安全库存预警',sys:['预警系统'],docInp:[],docOut:[]},{id:'a6',num:'06',name:'出入库管理',sys:['WMS系统'],docInp:[],docOut:['出入库单']},{id:'a7',num:'07',name:'数据同步',sys:[],docInp:[],docOut:[]}]},
      {id:'s3',name:'采购部门',acts:[{id:'a5',num:'05',name:'采购补货',sys:['ERP系统'],docInp:[],docOut:['采购订单']}]},
      {id:'s4',name:'销售部门',acts:[{id:'a8',num:'08',name:'库存报表',sys:[],docInp:[],docOut:['库存报表']}]},
      {id:'s5',name:'财务部门',acts:[{id:'a3',num:'03',name:'库存调整',sys:['财务系统'],docInp:[],docOut:['库存调整单']}]}
    ],
    info: `### 流程信息
- 流程名称：库存管理流程
- 版本号：7.1
- 画布尺寸：1920 x 1080

### 角色与泳道（5个）
- lane1：流程驱动（第一泳道，包含开始和结束）
- lane2：仓储部门
- lane3：采购部门
- lane4：销售部门
- lane5：财务部门

### 活动清单（按流程顺序）
01 库存盘点（lane2）| 系统：WMS系统 | 输出：《盘点表》
02 差异分析（lane2）| 输出：《差异分析报告》
03 库存调整（lane5）| 系统：财务系统 | 输出：《库存调整单》
04 安全库存预警（lane2）| 系统：预警系统
05 采购补货（lane3）| 系统：ERP系统 | 输出：《采购订单》
06 出入库管理（lane2）| 系统：WMS系统 | 输出：《出入库单》
07 数据同步（lane2）
08 库存报表（lane4）| 输出：《库存报表》

### 决策点（2个）
- decision01：差异是否合理？| Yes → step03（库存调整）| No → 返回 step01（库存盘点）
- decision02：是否触发补货？| Yes → step05（采购补货）| No → step06（出入库管理）

### 连接关系
start → step01 → step02 → decision01
decision01 -[是]→ step03 → step04 → decision02
decision01 -[否]→ step01（返回）
decision02 -[是]→ step05 → step06
decision02 -[否]→ step06
step06 → step07 → step08 → end`
  }
};

export const XML_TEMPLATES: Record<string, string> = {
  "pig-transfer": "",
  "purchase-exec": "",
  "payment-approval": "",
  "inventory-mgmt": ""
};
