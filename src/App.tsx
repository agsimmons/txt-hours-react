import {
  useRef,
  useState,
  useMemo,
  type SetStateAction,
  type Dispatch,
} from "react";
import { Temporal } from "temporal-polyfill";
import "./App.css";

type UIState = "input" | "help" | "error" | "result";

type DayBlock = {
  date: Temporal.PlainDate;
  timeEntries: TimeEntry[];
};
type TimeEntry = {
  taskName: string;
  duration: Temporal.Duration;
};

type DateIndexedTaskDurations = Map<Temporal.PlainDate, TaskDurationMap>;
type TaskDurationMap = Map<string, Temporal.Duration>;

type TaskIndexedTaskDurations = Map<string, DateDurationMap>;
type DateDurationMap = Map<Temporal.PlainDate, Temporal.Duration>;

type ValidatedData = {
  dates: Temporal.PlainDate[];
  taskNames: string[];
  taskIndexedTaskDurations: TaskIndexedTaskDurations;
};

const ANCHOR_DATE = new Temporal.PlainDate(2000, 1, 1);

type ResultTableProps = {
  validatedData: ValidatedData;
  onReturnToInput: () => void;
};

function ResultTable({ validatedData, onReturnToInput }: ResultTableProps) {
  return (
    <>
      <button type="button" onClick={onReturnToInput}>
        Return to input
      </button>
      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            {validatedData.dates.map((date) => (
              <th key={date.toString()} scope="col">
                {date.toString()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {validatedData.taskNames.map((taskName) => (
            <tr key={taskName}>
              <th scope="row">{taskName}</th>
              {validatedData.dates.map((date) => (
                <td key={date.toString()}>
                  {validatedData.taskIndexedTaskDurations
                    .get(taskName)
                    ?.get(date) !== undefined
                    ? Number(
                        validatedData.taskIndexedTaskDurations
                          .get(taskName)
                          ?.get(date)
                          ?.total({ unit: "hours" })
                      ).toFixed(2)
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

type ErrorDisplayProps = {
  message: string;
};

function ErrorDisplay({ message }: ErrorDisplayProps) {
  return <p>{message}</p>;
}

type DataEntryProps = {
  setValidatedData: Dispatch<SetStateAction<ValidatedData | null>>;
  setUIState: Dispatch<SetStateAction<UIState>>;
};

function DataEntry({ setValidatedData, setUIState }: DataEntryProps) {
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  const processData = () => {
    setValidatedData(null);

    if (textInputRef.current === null) return;

    const dayBlocks: DayBlock[] = [];

    for (const dayBlockData of textInputRef.current.value.split("\n\n")) {
      const [dateLine, ...timeLines] = dayBlockData.split("\n");

      const date = Temporal.PlainDate.from(dateLine);

      const timeEntries: TimeEntry[] = [];

      for (const timeEntryLine of timeLines) {
        const startTimeString = timeEntryLine.split(" - ")[0];
        const [startTimeHourString, startTimeMinuteString] =
          startTimeString.split(":");
        const startTime = new Temporal.PlainTime(
          parseInt(startTimeHourString),
          parseInt(startTimeMinuteString)
        );

        const endTimeString = timeEntryLine.split(" - ")[1].split(" : ")[0];
        const [endTimeHourString, endTimeMinuteString] =
          endTimeString.split(":");
        let endTime = new Temporal.PlainTime(
          parseInt(endTimeHourString),
          parseInt(endTimeMinuteString)
        );

        const taskName = timeEntryLine.split(" - ")[1].split(" : ")[1];

        if (Temporal.PlainTime.compare(endTime, startTime) < 0) {
          endTime = endTime.add({ hours: 12 });
        }

        const duration = ANCHOR_DATE.toPlainDateTime(endTime).since(
          ANCHOR_DATE.toPlainDateTime(startTime)
        );

        timeEntries.push({
          taskName,
          duration,
        });
      }

      dayBlocks.push({
        date,
        timeEntries,
      });
    }

    const dateIndexedTaskDurations: DateIndexedTaskDurations = new Map();

    for (const dayBlock of dayBlocks) {
      const taskDurationMap: TaskDurationMap = new Map();

      for (const timeEntry of dayBlock.timeEntries) {
        if (!taskDurationMap.has(timeEntry.taskName)) {
          taskDurationMap.set(timeEntry.taskName, timeEntry.duration);
        } else {
          taskDurationMap.set(
            timeEntry.taskName,
            taskDurationMap.get(timeEntry.taskName)!.add(timeEntry.duration)
          );
        }
      }

      dateIndexedTaskDurations.set(dayBlock.date, taskDurationMap);
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

type HelpGuideProps = {
  onReturnToInput: () => void;
};

function HelpGuide({ onReturnToInput }: HelpGuideProps) {
  return (
    <>
      <h2>Help</h2>
      <button type="button" onClick={onReturnToInput}>
        Return to input
      </button>
      <p>
        txt-hours is a method for tracking your time spent on tasks throughout
        the day. The start and stop times of each task is recorded in a
        well-defined plaintext format. This text can then be parsed to display a
        table of the total amount of time in hours spent on each task each day.
      </p>

      <p>
        Your txt-hours document is composed of a list of day blocks separated by
        an empty line. Each day block starts with the day's date in YYYY-MM-DD
        format on it's own line, followed by one or more task record. Each task
        record is composed of a start time, an end time, and a task description.
        Each time is entered in HH:MM format, where hour is between 1 and 12
        inclusive. AM and PM is inferred automatically and must not be written
        out.
      </p>

      <p>
        To use this method, create a new text document on your computer when you
        are ready to begin working on tasks. Begin the document with today's
        date, and start your first task record with the current time. As you
        don't yet know when you will switch tasks, enter ?? as the end time for
        the record. Enter in a task description, and begin your work. When you
        are ready to switch tasks, replace the ?? placeholder for the end task,
        and enter in the actual end time. Start a new task record on the next
        line and begin your next task. At the end of the day, you will have a
        complete record of your day's work. Repeat this process the next day
        with a new day block.
      </p>

      <p>
        Aim to keep your task descriptions general and re-usable. Instead of
        saying "Fix typo in intro paragragh of my book", say "Novel Writing".
        This will allow you to get totals for types of work in your
        summaziation.
      </p>

      <p>
        When you would like to summarize your time, visit this site and paste
        the contents of your text document into the text input area. You would
        typically only copy data that you have not yet summarized, but this
        would vary by workflow. Press Submit, and you will be presented with the
        result table. Columns are shown for each day recorded in your text
        document sorted by date. Rows are shown for each unique task description
        sorted alphabetically. The cells at the intersection of the two contain
        the number of hours spent on that task on that day, rounded to two
        decimal places.
      </p>

      <p>
        If pressing the submit button doesn't do anything, or if you are shown
        an error message, then there is an error in your text. Some common
        mistakes are that you forgot to replace a ?? placeholder time, you
        missed a : in one of your times, you missed the - between times, or that
        you missed the : before your task description. Look over your document
        for any mistakes, correct them, and try submitting again. If you still
        have an error, try removing the last few days from the text and submit
        again. This can help you narrow down where the error is. I would like to
        add better error handling so that the exact location of your error can
        be pointed out to you, but that has not yet been implemented.
      </p>

      <p>
        If you encounter any bugs, or would like to make a feature suggestion,
        create an Issue on the repo here:
        <a
          href="https://github.com/agsimmons/txt-hours-react"
          target="_blank"
          rel="noreferrer noopener"
        >
          https://github.com/agsimmons/txt-hours-react
        </a>
      </p>
    </>
  );
}

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
        return <p>TODO: Error State</p>;
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
