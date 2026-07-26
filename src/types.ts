export interface Activity {
  id: string;
  num: string;
  name: string;
  sys: string[];
  docInp: string[];
  docOut: string[];
  isDecision?: boolean;
  decisionYes?: string;
  decisionNo?: string;
}

export interface Swimlane {
  id: string;
  name: string;
  acts: Activity[];
}

export interface ProcessData {
  pCode: string;
  pName: string;
  code?: string;
  name?: string;
  info?: string;
  swimlanes: Swimlane[];
}

export interface AiConfig {
  apiKey?: string;
  model: string;
  endpoint?: string;
  temperature: number;
}

export interface DrawioStatus {
  isReady: boolean;
  status: 'idle' | 'generating' | 'success' | 'error';
  errorMessage?: string;
}
