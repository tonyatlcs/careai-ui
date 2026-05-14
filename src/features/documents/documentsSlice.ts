import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DocumentsState {
  documentIds: string[];
}

const initialState: DocumentsState = {
  documentIds: [],
};

export const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocumentIds: (state, action: PayloadAction<string[]>) => {
      state.documentIds = action.payload;
    },
    addDocumentId: (state, action: PayloadAction<string>) => {
      if (!state.documentIds.includes(action.payload)) {
        state.documentIds.push(action.payload);
      }
    },
    removeDocumentId: (state, action: PayloadAction<string>) => {
      state.documentIds = state.documentIds.filter(
        (documentId) => documentId !== action.payload,
      );
    },
    clearDocumentIds: (state) => {
      state.documentIds = [];
    },
  },
});

export const {
  addDocumentId,
  clearDocumentIds,
  removeDocumentId,
  setDocumentIds,
} = documentsSlice.actions;
export const documentsReducer = documentsSlice.reducer;
