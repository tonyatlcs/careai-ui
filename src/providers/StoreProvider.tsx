import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";

/**
 * Provides Redux store to the application.
 * Use this to wrap your app (similar to IconProvider pattern).
 *
 * @param {React.ReactNode} children - The child components that will have access to the store.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {() => children}
      </PersistGate>
    </Provider>
  );
}
