import { useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import NotificationsPage from './pages/Notifications';
import PriorityInboxPage from './pages/Priority';
import { useNotifications } from './hooks/useNotifications';
import Log from './services/logService';

function App() {
  const notificationsState = useNotifications('inbox');
  const { activeView, setActiveView, priorityCount } = notificationsState;

  useEffect(() => {
    Log(
      'frontend',
      'info',
      'app',
      'Campus Notification Application loaded'
    );
  }, []);

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      priorityCount={priorityCount}
    >
      {activeView === 'priority' ? (
        <PriorityInboxPage notificationsState={notificationsState} />
      ) : (
        <NotificationsPage notificationsState={notificationsState} />
      )}
    </DashboardLayout>
  );
}

export default App;
