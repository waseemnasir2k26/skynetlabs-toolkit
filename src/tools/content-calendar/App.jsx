import { useState } from 'react';
import SetupWizard from './components/SetupWizard';
import CalendarView from './components/CalendarView';
import { generateContentCalendar } from './data/contentLibrary';

function App() {
  const [calendarData, setCalendarData] = useState(null);
  const [showWizard, setShowWizard] = useState(true);

  const handleGenerate = (config) => {
    const data = generateContentCalendar(config);
    setCalendarData(data);
    setShowWizard(false);
  };

  const handleReset = () => {
    setCalendarData(null);
    setShowWizard(true);
  };

  const handleRegenerate = (config) => {
    const data = generateContentCalendar(config);
    setCalendarData(data);
  };

  return (
    <div className="py-6">
      <main className="flex-1">
        {showWizard ? (
          <SetupWizard onGenerate={handleGenerate} />
        ) : (
          <CalendarView
            calendarData={calendarData}
            setCalendarData={setCalendarData}
            onReset={handleReset}
            onRegenerate={handleRegenerate}
          />
        )}
      </main>
    </div>
  );
}

export default App;
