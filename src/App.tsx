import { useState, useMemo } from "react"

import "./assets/App.css"
import { DataEntry } from "./components/DataEntry"
import { ErrorDisplay } from "./components/ErrorDisplay"
import { HelpGuide } from "./components/HelpGuide"
import { ResultTable } from "./components/ResultTable"
import type { UIState, ValidatedData } from "./types"

function App() {
  const [uiState, setUIState] = useState<UIState>("input")

  const [inputText, setInputText] = useState<string>("")
  const [errorText, _setErrorText] = useState<string>("")

  const [validatedData, setValidatedData] = useState<ValidatedData | null>(null)

  const pageContents = useMemo((): React.JSX.Element | null => {
    switch (uiState) {
      case "input":
        return (
          <DataEntry
            setUIState={setUIState}
            inputText={inputText}
            setInputText={setInputText}
            setValidatedData={setValidatedData}
          />
        )
      case "help":
        return <HelpGuide onReturnToInput={() => setUIState("input")} />
      case "error":
        return <ErrorDisplay message={errorText} />
      case "result":
        return (
          validatedData && (
            <ResultTable
              validatedData={validatedData}
              onReturnToInput={() => setUIState("input")}
            />
          )
        )
      default:
        return null
    }
  }, [uiState, inputText, errorText, validatedData])

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
  )
}

export default App
