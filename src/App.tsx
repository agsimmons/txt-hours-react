import { useState, useMemo } from "react";
import "./assets/App.css";
import type { UIState, ValidatedData } from "./types";
import { HelpGuide } from "./components/HelpGuide";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { ResultTable } from "./components/ResultTable";
import { DataEntry } from "./components/DataEntry";

function App() {
  const [uiState, setUIState] = useState<UIState>("input");

  const [validatedData, setValidatedData] = useState<ValidatedData | null>(
    null
  );

  const pageContents = useMemo((): React.JSX.Element | null => {
    switch (uiState) {
      case "input":
        return (
          <DataEntry
            setValidatedData={setValidatedData}
            setUIState={setUIState}
          />
        );
      case "help":
        return <HelpGuide onReturnToInput={() => setUIState("input")} />;
      case "error":
        return <ErrorDisplay message="TODO: Error State" />;
      case "result":
        return (
          validatedData && (
            <ResultTable
              validatedData={validatedData}
              onReturnToInput={() => setUIState("input")}
            />
          )
        );
      default:
        return null;
    }
  }, [uiState, validatedData]);

  return (
    <>
      <h1>txt-hours</h1>
      {uiState === "input" && (
        <button type="button" onClick={() => setUIState("help")}>
          Help
        </button>
      )}
      {pageContents}
    </>
  );
}

export default App;
