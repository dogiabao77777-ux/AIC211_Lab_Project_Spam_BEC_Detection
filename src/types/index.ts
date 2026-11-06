export type EmailCategory = 'bec' | 'phishing' | 'spam' | 'ham';
export type GatewayStatus = 'BLOCKED' | 'QUARANTINED' | 'DELIVERED';

export interface EmailRecord {
  id: string;
  time: string;
  sender: string;
  subject: string;
  category: EmailCategory;
  score: number;
  status: GatewayStatus;
  content: string;
  custom?: boolean;
}

export interface AuditLogEntry {
  id: string;
  time: string;
  action: 'ADD' | 'DELETE' | 'RESET' | 'SCAN';
  recordId: string;
  subject: string;
  category: string;
  operator: string;
}

export interface ModelMetric {
  Model: string;
  Accuracy: number;
  Precision: number;
  Recall: number;
  F1Score: number;
  PRAUC: number;
  FP: number;
  FN: number;
  Strategy: string;
  Description: string;
}

export interface XAIToken {
  word: string;
  weight: number;
  type: 'threat' | 'benign';
  signal: string;
}

export interface MathFormulaItem {
  id: string;
  title: string;
  category: 'nlp' | 'ml' | 'imbalance' | 'evaluation' | 'security';
  formulaLaTeX: string;
  variables: { name: string; meaning: string }[];
  cybersecuritySignificance: string;
  mathExplanation: string;
}

export interface StepInstruction {
  stepNumber: number;
  title: string;
  codeSnippet: string;
  purpose: string;
  inputs: string;
  outputs: string;
  securityImpact: string;
}

export interface RubricCriteria {
  criterionNumber: number;
  name: string;
  maxScore: number;
  expectedContent: string;
  projectEvidence: string;
  achievedScore: number;
}
