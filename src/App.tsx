import { useState, useMemo } from "react"

import "./assets/App.css"
import DataEntry from "./components/DataEntry"
import ErrorDisplay from "./components/ErrorDisplay"
import HelpGuide from "./components/HelpGuide"
import ResultTable from "./components/ResultTable"
import type { TaskEntry, UIState } from "./types"

function App() {
  const [uiState, setUIState] = useState<UIState>("input")

  const [inputText, setInputText] = useState<string>("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorText, setErrorText] = useState<string>("")

  const [tasks, setTasks] = useState<TaskEntry[] | null>(null)

  const pageContents = useMemo((): React.JSX.Element | null => {
    switch (uiState) {
      case "input":
        return (
          <DataEntry
            setUIState={setUIState}
            inputText={inputText}
            setInputText={setInputText}
            setTasks={setTasks}
          />
        )
      case "help":
        return <HelpGuide onReturnToInput={() => setUIState("input")} />
      case "error":
        return <ErrorDisplay message={errorText} />
      case "result":
        return tasks && <ResultTable tasks={tasks} onReturnToInput={() => setUIState("input")} />
      default:
        return null
    }
  }, [uiState, inputText, errorText, tasks])

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
