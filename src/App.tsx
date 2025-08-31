import { useRef, useState } from "react";
import { Temporal } from "temporal-polyfill";
import "./App.css";

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

const MIDNIGHT = new Temporal.PlainTime(0, 0);
const NOON = new Temporal.PlainTime(12, 0);
const ANCHOR_DATE = new Temporal.PlainDate(2000, 1, 1);

type ResultTableProps = {
  validatedData: ValidatedData;
};

function ResultTable({ validatedData }: ResultTableProps) {
  return (
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
  );
}

function App() {
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [validatedData, setValidatedData] = useState<ValidatedData | null>(
    null
  );

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
        let startTime = new Temporal.PlainTime(
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

        if (startTime == NOON && endTime == NOON) {
          startTime = MIDNIGHT;
        } else if (Temporal.PlainTime.compare(endTime, startTime) <= 0) {
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
  };

  return (
    <>
      <h1>txt-hours</h1>
      <textarea ref={textInputRef} style={{ width: "100%", height: "75vh" }} />
      <button type="button" onClick={processData}>
        Submit
      </button>
      {validatedData && <ResultTable validatedData={validatedData} />}
    </>
  );
}

export default App;
