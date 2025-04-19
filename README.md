# Toggl Report Vibe

A Next.js application for generating customized reports from Toggl time entries.

## Features

- Form for inputting Toggl API credentials and parameters
- Integration with Toggl API to fetch time entries
- Report generation with daily summaries
- Downloadable CSV export
- Material UI components for a clean, responsive UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alexzelenuyk/toggle-report-vibe.git
   cd toggle-report-vibe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. Fill in the form with:
   - Workspace ID (from your Toggl account)
   - Start and End dates for the report
   - Your Toggl API token (found in your Toggl profile settings)
   - Optional Job ID for filtering or tagging entries

2. Click "Generate Report" to fetch and process the time entries

3. View the summarized data in the table

4. Export your data either by:
   - Clicking "Copy CSV to Clipboard" to copy the data directly to your clipboard
   - Clicking "Download CSV" to download the file to your computer

## Report Format

The generated CSV file follows this format:

```
start_date,start_time,end_time,job_id,pause_duration,total_hours,description
2025-03-24,08:53,18:15,293378-220,0.75,8.50,API-2846: kafka; Client meeting; Documentation
```

- Entries are grouped by day
- Descriptions for the same day are combined with semicolon separators
- Duplicate descriptions are included only once (no count displayed)
- Pause duration shows total time between time entries for the day as a relative value (1.0 = 60 minutes, 0.5 = 30 minutes)
- Total hours is calculated as: end time - start time - pause duration
- Pause calculation is second-precise and rounds up to the nearest minute
- Only counts gaps between entries (not overlapping time)
- Values use period as decimal separator
- Times are rounded to minutes (no seconds displayed)
- The date picker starts weeks on Monday

## License

MIT