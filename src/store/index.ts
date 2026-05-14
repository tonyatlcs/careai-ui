import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { dashboardReducer } from "@/features/dashboard/dashboardSlice";
import { documentsReducer } from "@/features/documents/documentsSlice";
import { rootApi } from "@/store/rootApi";

/** Avoid `redux-persist/lib/storage` default import — Vite ESM/CJS interop can yield a non-object and break `getItem`. */
const persistStorage = {
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(
      typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
    ),
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  documents: documentsReducer,
  [rootApi.reducerPath]: rootApi.reducer,
});

const persistedReducer = persistReducer(
  {
    key: "root",
    storage: persistStorage,
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(rootApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
