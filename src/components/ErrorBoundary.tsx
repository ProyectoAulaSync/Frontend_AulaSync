import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorPage from "../pages/ErrorPage";

type Props = { children: ReactNode };
type State = { hayError: boolean };

// Captura errores inesperados de renderizado y muestra la vista de error en lugar de una pantalla en blanco.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hayError: false };

  static getDerivedStateFromError(): State {
    return { hayError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    return this.state.hayError ? <ErrorPage /> : this.props.children;
  }
}
