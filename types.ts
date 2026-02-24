export enum ExerciseType {
  NUMBER_MATRIX = 'NUMBER_MATRIX',
  WORD_CHAINS = 'WORD_CHAINS',
  FLASHCARDS = 'FLASHCARDS',
  FACE_NAME = 'FACE_NAME',
  ABSTRACT_IMAGES = 'ABSTRACT_IMAGES'
}

export enum GameState {
  CONFIG = 'CONFIG',
  PREPARE = 'PREPARE',
  MEMORIZE = 'MEMORIZE',
  RECALL = 'RECALL',
  RESULTS = 'RESULTS'
}

export interface NumberConfig {
  digitCount: number;
  groupSize: number; // For chunking (e.g., 2 digits: 45 99 12)
  durationSeconds: number;
}

export interface ModuleStatus {
  id: number;
  title: string;
  description: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface MnemonicTip {
  text: string;
  technique: string;
}
