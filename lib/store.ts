import { create } from 'zustand';
import { VitalsData, PatientData, InsuranceData, AdditionalInfoData } from './validation';

export type VitalStatus = 'waiting' | 'capturing' | 'captured';

export interface VitalState {
  status: VitalStatus;
  currentValue: number | null;
  samples: number[];
  capturedValue: number | null;
}

export interface AppState {
  // Patient data
  patient: Partial<PatientData>;
  insurance: Partial<InsuranceData>;
  additional: Partial<AdditionalInfoData>;
  
  // Vitals data
  vitals: {
    bpSys: VitalState;
    bpDia: VitalState;
    hr: VitalState;
    spo2: VitalState;
    tempC: VitalState;
    weightKg: VitalState;
  };
  
  // Capture state
  isCapturing: boolean;
  captureStartTime: number | null;
  
  // Serial connection
  isSerialConnected: boolean;
  isSimulating: boolean;
  
  // Current visit
  currentVisitId: string | null;
  
  // Visit data for review/success flow
  visitData: {
    patient: Partial<PatientData>;
    insurance: Partial<InsuranceData>;
    additional: Partial<AdditionalInfoData>;
    vitals: Partial<VitalsData>;
  } | null;
  
  // Actions
  updatePatient: (data: Partial<PatientData>) => void;
  updateInsurance: (data: Partial<InsuranceData>) => void;
  updateAdditional: (data: Partial<AdditionalInfoData>) => void;
  
  updateVitalValue: (vital: keyof AppState['vitals'], value: number) => void;
  startCapture: () => void;
  stopCapture: () => void;
  captureVital: (vital: keyof AppState['vitals']) => void;
  resetVital: (vital: keyof AppState['vitals']) => void;
  
  setSerialConnected: (connected: boolean) => void;
  setSimulating: (simulating: boolean) => void;
  
  setCurrentVisitId: (id: string | null) => void;
  saveVisitData: () => void;
  resetVisit: () => void;
  
  // Computed getters
  getVitalsData: () => Partial<VitalsData>;
  isVitalsComplete: () => boolean;
  isPatientComplete: () => boolean;
  canContinue: () => boolean;
}

const initialVitalState: VitalState = {
  status: 'waiting',
  currentValue: null,
  samples: [],
  capturedValue: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  patient: {
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-01-01',
  },
  insurance: {
    provider: 'Test Insurance',
    memberId: '123456789',
  },
  additional: {
    symptoms: 'Chest pain and shortness of breath',
    durationValue: 2,
    durationUnit: 'hours',
  },
  
  vitals: {
    bpSys: { ...initialVitalState, capturedValue: 120 },
    bpDia: { ...initialVitalState, capturedValue: 80 },
    hr: { ...initialVitalState, capturedValue: 72 },
    spo2: { ...initialVitalState, capturedValue: 98 },
    tempC: { ...initialVitalState, capturedValue: 36.5 },
    weightKg: { ...initialVitalState, capturedValue: 70 },
  },
  
  isCapturing: false,
  captureStartTime: null,
  isSerialConnected: false,
  isSimulating: false,
  currentVisitId: null,
  visitData: null,
  
  // Actions
  updatePatient: (data) => set((state) => ({ patient: { ...state.patient, ...data } })),
  
  updateInsurance: (data) => set((state) => ({ insurance: { ...state.insurance, ...data } })),
  
  updateAdditional: (data) => set((state) => ({ additional: { ...state.additional, ...data } })),
  
  updateVitalValue: (vital, value) => set((state) => {
    const vitalState = state.vitals[vital];
    const newSamples = [...vitalState.samples, value];
    
    return {
      vitals: {
        ...state.vitals,
        [vital]: {
          ...vitalState,
          currentValue: value,
          samples: newSamples,
          status: state.isCapturing ? 'capturing' : 'waiting',
        },
      },
    };
  }),
  
  startCapture: () => set((state) => ({
    isCapturing: true,
    captureStartTime: Date.now(),
    vitals: {
      bpSys: { ...state.vitals.bpSys, status: 'capturing', samples: [] },
      bpDia: { ...state.vitals.bpDia, status: 'capturing', samples: [] },
      hr: { ...state.vitals.hr, status: 'capturing', samples: [] },
      spo2: { ...state.vitals.spo2, status: 'capturing', samples: [] },
      tempC: { ...state.vitals.tempC, status: 'capturing', samples: [] },
      weightKg: { ...state.vitals.weightKg, status: 'capturing', samples: [] },
    },
  })),
  
  stopCapture: () => set(() => ({
    isCapturing: false,
    captureStartTime: null,
  })),
  
  captureVital: (vital) => set((state) => {
    const vitalState = state.vitals[vital];
    if (vitalState.samples.length === 0) return state;
    
    // Calculate median value
    const sortedSamples = [...vitalState.samples].sort((a, b) => a - b);
    const median = sortedSamples[Math.floor(sortedSamples.length / 2)];
    
    return {
      vitals: {
        ...state.vitals,
        [vital]: {
          ...vitalState,
          status: 'captured',
          capturedValue: median,
        },
      },
    };
  }),
  
  resetVital: (vital) => set((state) => ({
    vitals: {
      ...state.vitals,
      [vital]: { ...initialVitalState },
    },
  })),
  
  setSerialConnected: (connected) => set({ isSerialConnected: connected }),
  
  setSimulating: (simulating) => set({ isSimulating: simulating }),
  
  setCurrentVisitId: (id) => set({ currentVisitId: id }),
  
  saveVisitData: () => set((state) => ({
    visitData: {
      patient: state.patient,
      insurance: state.insurance,
      additional: state.additional,
      vitals: state.getVitalsData(),
    },
  })),
  
  resetVisit: () => set({
    patient: {},
    insurance: {},
    additional: {},
    vitals: {
      bpSys: { ...initialVitalState },
      bpDia: { ...initialVitalState },
      hr: { ...initialVitalState },
      spo2: { ...initialVitalState },
      tempC: { ...initialVitalState },
      weightKg: { ...initialVitalState },
    },
    isCapturing: false,
    captureStartTime: null,
    isSerialConnected: false,
    isSimulating: false,
    currentVisitId: null,
    visitData: null,
  }),
  
  // Computed getters
  getVitalsData: () => {
    const state = get();
    const vitals: Partial<VitalsData> = {};
    
    Object.entries(state.vitals).forEach(([key, vital]) => {
      if (vital.capturedValue !== null) {
        (vitals as Record<string, number>)[key] = vital.capturedValue;
      }
    });
    
    return vitals;
  },
  
  isVitalsComplete: () => {
    const state = get();
    const requiredVitals = ['bpSys', 'bpDia', 'hr', 'spo2', 'tempC'] as const;
    return requiredVitals.every(vital => state.vitals[vital].status === 'captured');
  },
  
  isPatientComplete: () => {
    const state = get();
    return !!(state.patient.firstName && state.patient.lastName && state.patient.dob);
  },
  
  canContinue: () => {
    const state = get();
    return state.isVitalsComplete() && state.isPatientComplete();
  },
}));
