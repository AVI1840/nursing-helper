import { create } from 'zustand';

export interface Allocation {
  cashHours: number;
  daycareDays: number;     // מרכז יום
  caregiverHours: number;  // מטפלת בבית
  community: boolean;       // קהילה תומכת
  panicButton: boolean;
  absorbency: boolean;
}

export interface NursingState {
  // User info (from URL params or manual input)
  name: string;
  level: number | null;
  hasForeignWorker: boolean;
  isSurvivor: boolean;
  
  // NEW: Professional parameters
  age: number | null;
  eligibilityType: 'permanent' | 'temporary' | null;
  dependencyScore: number | null;
  
  // Allocation
  allocation: Allocation;
  
  // Navigation
  currentStep: number;
  
  // Actions
  setName: (name: string) => void;
  setLevel: (level: number) => void;
  setHasForeignWorker: (value: boolean) => void;
  setIsSurvivor: (value: boolean) => void;
  setAge: (age: number) => void;
  setEligibilityType: (type: 'permanent' | 'temporary') => void;
  setDependencyScore: (score: number) => void;
  setAllocation: (allocation: Partial<Allocation>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  initFromParams: (
    name: string, 
    level: number, 
    hasForeignWorker: boolean,
    age?: number,
    eligibilityType?: 'permanent' | 'temporary',
    dependencyScore?: number
  ) => void;
}

const initialAllocation: Allocation = {
  cashHours: 0,
  daycareDays: 0,
  caregiverHours: 0,
  community: false,
  panicButton: false,
  absorbency: false,
};

export const useNursingStore = create<NursingState>((set) => ({
  name: '',
  level: null,
  hasForeignWorker: false,
  isSurvivor: false,
  age: null,
  eligibilityType: null,
  dependencyScore: null,
  allocation: initialAllocation,
  currentStep: 1,
  
  setName: (name) => set({ name }),
  setLevel: (level) => set({ level }),
  setHasForeignWorker: (value) => set({ hasForeignWorker: value }),
  setIsSurvivor: (value) => set({ isSurvivor: value }),
  setAge: (age) => set({ age }),
  setEligibilityType: (type) => set({ eligibilityType: type }),
  setDependencyScore: (score) => set({ dependencyScore: score }),
  setAllocation: (allocation) => set((state) => ({
    allocation: { ...state.allocation, ...allocation }
  })),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  reset: () => set({
    name: '',
    level: null,
    hasForeignWorker: false,
    isSurvivor: false,
    age: null,
    eligibilityType: null,
    dependencyScore: null,
    allocation: initialAllocation,
    currentStep: 1,
  }),
  initFromParams: (name, level, hasForeignWorker, age, eligibilityType, dependencyScore) => set({
    name,
    level,
    hasForeignWorker,
    age: age ?? null,
    eligibilityType: eligibilityType ?? null,
    dependencyScore: dependencyScore ?? null,
    currentStep: 1,
    allocation: initialAllocation,
  }),
}));
