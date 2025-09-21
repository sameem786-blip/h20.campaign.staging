import { create } from "zustand";

export type Message = {
  text: string;
  time: string;
  role: "bot" | "user";
};

export type BuilderData = {
  campaignName: string;
  companyName: string;
  companyUrl: string;
  productDesc: string;
  valueProp: string;
  problemSolved: string;
  competitors: string;
  countries: string[];
  interests: string[];
  networks: string[];
};

interface CampaignBuilderState {
  // Form state
  builderData: BuilderData;
  editCards: Set<string>;
  draft: Partial<BuilderData & { countriesInput?: string; interestsInput?: string }>;
  
  // Chat state
  messages: Message[];
  input: string;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Auto-scroll state
  lastUpdatedFields: string[];
  highlightedFields: string[];
  
  // Actions
  setBuilderData: (data: Partial<BuilderData>) => void;
  setEditCards: (cards: Set<string>) => void;
  setDraft: (draft: Partial<BuilderData & { countriesInput?: string; interestsInput?: string }>) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setInput: (input: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastUpdatedFields: (fields: string[]) => void;
  clearLastUpdatedFields: () => void;
  setHighlightedFields: (fields: string[]) => void;
  removeHighlightedField: (field: string) => void;
  
  // Reset functionality
  resetAllState: () => void;
  initializeChat: () => void;
}

const initialBuilderData: BuilderData = {
  campaignName: "",
  companyName: "",
  companyUrl: "",
  productDesc: "",
  valueProp: "",
  problemSolved: "",
  competitors: "",
  countries: [],
  interests: [],
  networks: [],
};

const initialMessage: Message = {
  text: "Hello! I'm here to help you build your campaign. I can assist you in filling out the form fields and provide guidance on creating an effective campaign. What would you like to work on?",
  time: new Date().toISOString(),
  role: "bot",
};

export const useCampaignBuilderStore = create<CampaignBuilderState>((set, get) => ({
  // Initial state
  builderData: initialBuilderData,
  editCards: new Set(),
  draft: {},
  messages: [],
  input: "",
  isLoading: false,
  isSaving: false,
  lastUpdatedFields: [],
  highlightedFields: [],
  
  // Actions
  setBuilderData: (data) => set((state) => ({
    builderData: { ...state.builderData, ...data }
  })),
  
  setEditCards: (cards) => set({ editCards: cards }),
  
  setDraft: (draft) => set((state) => ({
    draft: { ...state.draft, ...draft }
  })),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setInput: (input) => set({ input }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setIsSaving: (saving) => set({ isSaving: saving }),
  
  setLastUpdatedFields: (fields) => set({ lastUpdatedFields: fields }),
  
  clearLastUpdatedFields: () => set({ lastUpdatedFields: [] }),
  
  setHighlightedFields: (fields) => set({ highlightedFields: fields }),
  
  removeHighlightedField: (field) => set((state) => ({
    highlightedFields: state.highlightedFields.filter(f => f !== field)
  })),
  
  // Reset functionality
  resetAllState: () => set({
    builderData: initialBuilderData,
    editCards: new Set(),
    draft: {},
    messages: [],
    input: "",
    isLoading: false,
    isSaving: false,
    lastUpdatedFields: [],
    highlightedFields: [],
  }),
  
  initializeChat: () => {
    const currentMessages = get().messages;
    if (currentMessages.length === 0) {
      set({ messages: [initialMessage] });
    }
  },
}));