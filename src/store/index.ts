import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { dashboardReducer } from "@/features/dashboard/dashboardSlice";
import { documentsReducer } from "@/features/documents/documentsSlice";
import { rootApi } from "@/store/rootApi";

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  documents: documentsReducer,
  [rootApi.reducerPath]: rootApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rootApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
