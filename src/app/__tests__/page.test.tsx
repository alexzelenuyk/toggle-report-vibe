import { render, screen } from '@testing-library/react';
import Page from '../page';

jest.mock('@/components/ReportForm', () => {
  return function MockReportForm() {
    return <div data-testid="report-form">Report Form Component</div>;
  };
});

describe('Home Page', () => {
  test('renders heading and ReportForm component', () => {
    render(<Page />);
    
    // Check for main heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Toggl Report/i);
    
    // Check that ReportForm is rendered
    expect(screen.getByTestId('report-form')).toBeInTheDocument();
  });
});