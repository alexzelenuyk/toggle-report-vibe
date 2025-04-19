# Toggl Report Vibe

A Next.js application for generating customized reports from Toggl time entries.

[![CI/CD Pipeline](https://github.com/alexzelenuyk/toggle-report-vibe/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/alexzelenuyk/toggle-report-vibe/actions/workflows/ci-cd.yml)
[![Vercel Deployment](https://therealsujitk-vercel-badge.vercel.app/?app=toggle-report-vibe)](https://toggle-report-vibe.vercel.app)

🚀 **Live Demo:** [https://toggle-report-vibe.vercel.app](https://toggle-report-vibe.vercel.app)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falexzelenuyk%2Ftoggle-report-vibe)

## Features

- Form for inputting Toggl API credentials and parameters
- Integration with Toggl API to fetch time entries
- Report generation with daily summaries
- Export options: Excel, CSV, or clipboard copy
- Material UI components for a clean, responsive UI

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is to use the "Deploy with Vercel" button above.

Alternatively, you can deploy it manually:

1. Fork this repository
2. Log in to [Vercel](https://vercel.com)
3. Create a new project and import your forked repository
4. Deploy!

### CI/CD with GitHub Actions

This project includes a GitHub Actions workflow for continuous integration and deployment:

1. On push to the main branch or pull requests targeting main, the workflow:
   - Runs ESLint checks
   - Verifies TypeScript types
   - Executes tests
   - Builds the application

2. When changes are pushed to the main branch, the workflow also:
   - Deploys the application to Vercel production environment

To set up the Vercel deployment in GitHub Actions:

1. Link your project to Vercel on your local machine:
   ```bash
   # Link your project to Vercel (run this once in your project directory)
   npx vercel
   ```

2. Run the helper script to get the necessary configuration values:
   ```bash
   npm run vercel-config
   ```

3. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token (create at https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID`: Your Vercel organization ID (shown by the helper script)
   - `VERCEL_PROJECT_ID`: Your Vercel project ID (shown by the helper script)

4. GitHub Actions will now automatically deploy your project to Vercel when you push to main.

### Local Development

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

4. Export your data using one of these options:
   - "Export to Excel" - download an Excel file with formatted columns
   - "Download CSV" - download a CSV file
   - "Copy CSV to Clipboard" - copy data directly to your clipboard

## Report Format

### CSV Format

The generated CSV file follows this format:

```
start_date,start_time,end_time,job_id,pause_duration,total_hours,description
2025-03-24,08:53,18:15,293378-220,0.75,8.50,API-2846: kafka; Client meeting; Documentation
```

### Excel Format

The Excel export uses the following column names:

| Date | StartTime | EndTime | JobCode | Break | TotalHours | Description |
|------|-----------|---------|---------|-------|------------|-------------|
| 2025-03-24 | 08:53 | 18:15 | 293378-220 | 0.75 | 8.50 | API-2846: kafka; Client meeting; Documentation |

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