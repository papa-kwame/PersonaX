import { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

export default function ReportScheduler({ reportType }) {
  const [schedule, setSchedule] = useState(null);

  const handleSchedule = (frequency) => {
    setSchedule(frequency);
    // API call to setup scheduled reports would go here
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-secondary" size="sm">
        <i className="bi bi-clock-history me-1"></i>
        {schedule ? `Scheduled: ${schedule}` : 'Schedule Report'}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header>Email Frequency</Dropdown.Header>
        <Dropdown.Item onClick={() => handleSchedule('Daily')}>
          Daily
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleSchedule('Weekly')}>
          Weekly
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleSchedule('Monthly')}>
          Monthly
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleSchedule(null)}>
          Disable Scheduling
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}