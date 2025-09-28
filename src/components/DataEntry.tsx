import { useRef, type SetStateAction, type Dispatch } from "react";
import { Temporal } from "temporal-polyfill";
import type {
  DateIndexedTaskDurations,
  FileAST,
  TaskDurationMap,
  TaskIndexedTaskDurations,
  UIState,
  ValidatedData,
} from "../types";
import { evaluate } from "../syntax/parser";

const ANCHOR_DATE = new Temporal.PlainDate(2000, 1, 1);

type DataEntryProps = {
  setValidatedData: Dispatch<SetStateAction<ValidatedData | null>>;
  setUIState: Dispatch<SetStateAction<UIState>>;
};

export function DataEntry({ setValidatedData, setUIState }: DataEntryProps) {
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  const processData = () => {
    setValidatedData(null);

    if (textInputRef.current === null) return;

    let file: FileAST;
    try {
      file = evaluate(textInputRef.current.value);
    } catch (error) {
      alert(error);
      return;
    }

    const dateIndexedTaskDurations: DateIndexedTaskDurations = new Map();

    for (const entry of file) {
      const taskDurationMap: TaskDurationMap = new Map();

      for (const timeEntry of entry.entries) {
        const duration = ANCHOR_DATE.toPlainDateTime(timeEntry.end).since(
          ANCHOR_DATE.toPlainDateTime(timeEntry.start)
        );

        if (!taskDurationMap.has(timeEntry.task)) {
          taskDurationMap.set(timeEntry.task, duration);
        } else {
          taskDurationMap.set(
            timeEntry.task,
            taskDurationMap.get(timeEntry.task)!.add(duration)
          );
        }
      }

      dateIndexedTaskDurations.set(entry.date, taskDurationMap);
    }

    const taskIndexedTaskDurations: TaskIndexedTaskDurations = new Map();

    for (const [date, taskDurationMap] of dateIndexedTaskDurations) {
      for (const [taskName, duration] of taskDurationMap) {
        if (!taskIndexedTaskDurations.has(taskName)) {
          taskIndexedTaskDurations.set(taskName, new Map());
        }

        if (!taskIndexedTaskDurations.get(taskName)!.has(date)) {
          taskIndexedTaskDurations.get(taskName)!.set(date, duration);
        } else {
          taskIndexedTaskDurations
            .get(taskName)!
            .set(
              date,
              taskIndexedTaskDurations.get(taskName)!.get(date)!.add(duration)
            );
        }
      }
    }

    setValidatedData({
      dates: Array.from(dateIndexedTaskDurations.keys()).sort((one, two) =>
        Temporal.PlainDate.compare(one, two)
      ),
      taskNames: Array.from(taskIndexedTaskDurations.keys()).sort((one, two) =>
        one.localeCompare(two)
      ),
      taskIndexedTaskDurations: taskIndexedTaskDurations,
    });
    setUIState("result");

    // TODO: Handle errors
  };

  return (
    <>
      <textarea ref={textInputRef} style={{ width: "100%", height: "75vh" }} />
      <button type="button" onClick={processData}>
        Submit
      </button>
    </>
  );
}
