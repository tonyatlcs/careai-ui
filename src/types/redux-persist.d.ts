declare module "redux-persist/integration/react" {
  import type { ReactNode } from "react";
  import { PureComponent } from "react";
  import type { Persistor } from "redux-persist";

  interface PersistGateProps {
    persistor: Persistor;
    onBeforeLift?(): void | Promise<void>;
    children?: ReactNode | ((bootstrapped: boolean) => ReactNode);
    loading?: ReactNode;
  }

  interface PersistGateState {
    bootstrapped: boolean;
  }

  export class PersistGate extends PureComponent<
    PersistGateProps,
    PersistGateState
  > {}
}

