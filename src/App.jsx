import { useState, useCallback } from 'react';
import Header from './components/Layout/Header';
import LandingView from './components/Landing/LandingView';
import MapView from './components/Map/MapView';
import SpotModal from './components/Modals/SpotModal';
import ReportModal from './components/Modals/ReportModal';
import BookingModal from './components/Modals/BookingModal';
import { useConditions } from './hooks/useConditions';
import { useWeather } from './hooks/useWeather';

function App() {
  // View state: 'landing' or 'map'
  const [currentView, setCurrentView] = useState('landing');

  // Modal state
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // null | 'report' | 'booking'

  // Data hooks
  const { conditions, zones, allSpots, loading, lastUpdated, alerts, getSpot, getSpotsByZone } = useConditions();
  const { weather } = useWeather();

  // Navigation handlers
  const handleExploreMap = useCallback(() => {
    setCurrentView('map');
  }, []);

  const handleBackToLanding = useCallback(() => {
    setCurrentView('landing');
    setSelectedSpot(null);
  }, []);

  // Spot selection
  const handleSelectSpot = useCallback((spot) => {
    setSelectedSpot(spot);
  }, []);

  const handleCloseSpotModal = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  // Modal handlers
  const handleOpenReport = useCallback(() => {
    setActiveModal('report');
  }, []);

  const handleOpenBooking = useCallback(() => {
    setActiveModal('booking');
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ocean-950 flex items-center justify-center">
        <div className="text-ocean-200 text-lg">Loading conditions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col">
      <Header
        lastUpdated={lastUpdated}
        onReportClick={handleOpenReport}
        onBookingClick={handleOpenBooking}
        showBackButton={currentView === 'map'}
        onBackClick={handleBackToLanding}
      />

      <main className="flex-1 relative">
        {currentView === 'landing' ? (
          <LandingView
            zones={zones}
            allSpots={allSpots}
            alerts={alerts}
            weather={weather}
            onExploreMap={handleExploreMap}
            onSelectSpot={handleSelectSpot}
          />
        ) : (
          <MapView
            zones={zones}
            allSpots={allSpots}
            weather={weather}
            onSelectSpot={handleSelectSpot}
            onBackToLanding={handleBackToLanding}
          />
        )}
      </main>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <SpotModal
          spot={selectedSpot}
          onClose={handleCloseSpotModal}
          onBooking={handleOpenBooking}
        />
      )}

      {/* Report Submission Modal */}
      {activeModal === 'report' && (
        <ReportModal
          allSpots={allSpots}
          onClose={handleCloseModal}
        />
      )}

      {/* Booking Inquiry Modal */}
      {activeModal === 'booking' && (
        <BookingModal
          onClose={handleCloseModal}
          preselectedSpot={selectedSpot}
        />
      )}
    </div>
  );
}

export default App;
