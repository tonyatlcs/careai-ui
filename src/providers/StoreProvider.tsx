import { Provider } from "react-redux";
import { store } from "@/store";

/**
 * Provides Redux store to the application.
 * Use this to wrap your app (similar to IconProvider pattern).
 *
 * @param {React.ReactNode} children - The child components that will have access to the store.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
