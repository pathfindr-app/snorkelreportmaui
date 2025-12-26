import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Layout/Header';
import LandingView from './components/Landing/LandingView';
import MapView from './components/Map/MapView';
import SpotModal from './components/Modals/SpotModal';
import ReportModal from './components/Modals/ReportModal';
import BookingModal from './components/Modals/BookingModal';
import { useConditions } from './hooks/useConditions';
import { useWeather } from './hooks/useWeather';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const { zones, allSpots, loading, lastUpdated, alerts } = useConditions();
  const { weather, userWeather } = useWeather();

  const handleExploreMap = useCallback(() => setCurrentView('map'), []);
  const handleBackToLanding = useCallback(() => {
    setCurrentView('landing');
    setSelectedSpot(null);
  }, []);
  const handleSelectSpot = useCallback((spot) => setSelectedSpot(spot), []);
  const handleCloseSpotModal = useCallback(() => setSelectedSpot(null), []);
  const handleOpenReport = useCallback(() => setActiveModal('report'), []);
  const handleOpenBooking = useCallback(() => setActiveModal('booking'), []);
  const handleCloseModal = useCallback(() => setActiveModal(null), []);

  if (loading) {
    return (
      <div className="h-screen bg-ocean-950 flex items-center justify-center">
        <div className="text-ocean-200 text-lg">Loading conditions...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-ocean-950 flex flex-col overflow-hidden">
      <Header
        lastUpdated={lastUpdated}
        onReportClick={handleOpenReport}
        onBookingClick={handleOpenBooking}
        showBackButton={currentView === 'map'}
        onBackClick={handleBackToLanding}
      />

      <main className="flex-1 overflow-hidden">
        {currentView === 'landing' ? (
          <LandingView
            zones={zones}
            allSpots={allSpots}
            alerts={alerts}
            weather={weather}
            userWeather={userWeather}
            onExploreMap={handleExploreMap}
            onSelectSpot={handleSelectSpot}
          />
        ) : (
          <MapView
            zones={zones}
            allSpots={allSpots}
            weather={weather}
            userWeather={userWeather}
            onSelectSpot={handleSelectSpot}
          />
        )}
      </main>

      {/* Modals rendered via portal */}
      {selectedSpot && createPortal(
        <SpotModal
          spot={selectedSpot}
          onClose={handleCloseSpotModal}
          onBooking={handleOpenBooking}
        />,
        document.body
      )}

      {activeModal === 'report' && createPortal(
        <ReportModal allSpots={allSpots} onClose={handleCloseModal} />,
        document.body
      )}

      {activeModal === 'booking' && createPortal(
        <BookingModal onClose={handleCloseModal} preselectedSpot={selectedSpot} />,
        document.body
      )}

      <Analytics />
    </div>
  );
}

export default App;
