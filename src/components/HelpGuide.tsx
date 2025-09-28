type HelpGuideProps = {
  onReturnToInput: () => void;
};

export function HelpGuide({ onReturnToInput }: HelpGuideProps) {
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

      <p>A complete example of a txt-hours document can be seen below</p>

      <pre>
        {`
2025-08-25
9:00 - 9:20 : Task 1
9:20 - 9:50 : Task 2
9:50 - 10:30 : Task 3
10:30 - 11:00 : Task 4
11:00 - 11:20 : Task 3
11:20 - 12:15 : Task 5
12:15 - 12:25 : Task 6
12:25 - 12:35 : Task 7
12:35 - 3:50 : Task 8
3:50 - 4:10 : Task 9
4:10 - 4:30 : Task 2
4:30 - 5:10 : Task 3
5:10 - 5:20 : Task 9
6:00 - 6:40 : Task 2

2025-08-26
8:35 - 9:00 : Task 2
9:00 - 9:10 : Task 13
9:10 - 9:45 : Task 7
9:45 - 11:00 : Task 4
11:00 - 11:23 : Task 10
11:23 - 12:00 : Task 4
12:00 - 12:20 : Task 8
12:20 - 12:50 : Task 9
12:50 - 1:05 : Task 5
1:05 - 2:00 : Task 11
2:00 - 3:30 : Task 12
3:30 - 3:45 : Task 13
3:45 - 4:30 : Task 11
4:30 - 5:10 : Task 3

2025-08-27
9:00 - 10:00 : Task 13
10:00 - 10:45 : Task 14
10:45 - 11:00 : Task 13
11:00 - 12:00 : Task 3
12:00 - 12:30 : Task 6
12:30 - 1:00 : Task 4
1:00 - 1:30 : Task 9
1:30 - 1:45 : Task 15
1:45 - 2:15 : Task 6
2:15 - 3:00 : Task 3
2:30 - 3:00 : Task 4
3:00 - 4:30 : Task 16
4:30 - 5:00 : Task 13`}
      </pre>
    </>
  );
}
