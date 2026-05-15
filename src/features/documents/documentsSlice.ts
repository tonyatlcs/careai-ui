import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CompletedDocumentNotification = {
  id: string;
  name: string;
};

export interface DocumentsState {
  documentIds: string[];
  /** Document IDs we are watching after a successful "Process Documents" request. */
  processingDocumentIds: string[];
  /** Successfully completed processing; shown in the header until dismissed. */
  completedDocumentNotifications: CompletedDocumentNotification[];
}

const initialState: DocumentsState = {
  documentIds: [],
  processingDocumentIds: [],
  completedDocumentNotifications: [],
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
    appendProcessingDocumentIds: (state, action: PayloadAction<string[]>) => {
      for (const id of action.payload) {
        if (!state.processingDocumentIds.includes(id)) {
          state.processingDocumentIds.push(id);
        }
      }
    },
    processingDocumentsCompleted: (
      state,
      action: PayloadAction<CompletedDocumentNotification[]>,
    ) => {
      const completedIds = new Set(action.payload.map((n) => n.id));
      state.processingDocumentIds = state.processingDocumentIds.filter(
        (id) => !completedIds.has(id),
      );
      for (const item of action.payload) {
        if (
          !state.completedDocumentNotifications.some((n) => n.id === item.id)
        ) {
          state.completedDocumentNotifications.push({
            id: item.id,
            name: item.name,
          });
        }
      }
    },
    processingDocumentsFailed: (state, action: PayloadAction<string[]>) => {
      const failedIds = new Set(action.payload);
      state.processingDocumentIds = state.processingDocumentIds.filter(
        (id) => !failedIds.has(id),
      );
    },
    dismissCompletedDocumentNotification: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.completedDocumentNotifications =
        state.completedDocumentNotifications.filter(
          (n) => n.id !== action.payload,
        );
    },
    clearCompletedDocumentNotifications: (state) => {
      state.completedDocumentNotifications = [];
    },
  },
});

export const {
  addDocumentId,
  appendProcessingDocumentIds,
  clearCompletedDocumentNotifications,
  clearDocumentIds,
  dismissCompletedDocumentNotification,
  processingDocumentsCompleted,
  processingDocumentsFailed,
  removeDocumentId,
  setDocumentIds,
} = documentsSlice.actions;
export const documentsReducer = documentsSlice.reducer;
