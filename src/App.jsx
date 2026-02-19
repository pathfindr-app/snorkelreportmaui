import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Layout/Header';
import LandingView from './components/Landing/LandingView';
import MapView from './components/Map/MapView';
import SpotModal from './components/Modals/SpotModal';
import ReportModal from './components/Modals/ReportModal';
import BookingModal from './components/Modals/BookingModal';
import BusinessModal from './components/Modals/BusinessModal';
import PrivateExperienceModal from './components/Modals/PrivateExperienceModal';
import { useConditions } from './hooks/useConditions';
import { useWeather } from './hooks/useWeather';
import businessesData from './data/businesses.json';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const { zones, allSpots, loading, lastUpdated, alerts } = useConditions();
  const { weather, userWeather } = useWeather();
  const businesses = businessesData.businesses;

  const handleExploreMap = useCallback(() => setCurrentView('map'), []);
  const handleBackToLanding = useCallback(() => {
    setCurrentView('landing');
    setSelectedSpot(null);
    setSelectedBusiness(null);
  }, []);
  const handleSelectSpot = useCallback((spot) => setSelectedSpot(spot), []);
  const handleCloseSpotModal = useCallback(() => setSelectedSpot(null), []);
  const handleSelectBusiness = useCallback((business) => setSelectedBusiness(business), []);
  const handleCloseBusinessModal = useCallback(() => setSelectedBusiness(null), []);
  const handleOpenReport = useCallback(() => setActiveModal('report'), []);
  const handleOpenBooking = useCallback(() => setActiveModal('booking'), []);
  const handleOpenPrivateExperience = useCallback(() => setActiveModal('private-experience'), []);
  const handleCloseModal = useCallback(() => setActiveModal(null), []);

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #030b12 0%, #051520 100%)' }}
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: '2px solid transparent',
                borderTopColor: '#00e5cc',
                animationDuration: '1.5s',
              }}
            />
            {/* Inner glow */}
            <div
              className="absolute inset-2 rounded-full animate-breathe"
              style={{
                background: 'radial-gradient(circle, rgba(0, 229, 204, 0.3) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-glow-cyan text-lg font-medium">Loading conditions...</p>
          <p className="text-ocean-500 text-sm mt-2">Checking Maui waters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #030b12 0%, #051520 100%)' }}>
      <Header
        lastUpdated={lastUpdated}
        onReportClick={handleOpenReport}
        onBookingClick={handleOpenBooking}
        onPrivateExperienceClick={handleOpenPrivateExperience}
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
            onPrivateExperienceClick={handleOpenPrivateExperience}
          />
        ) : (
          <MapView
            zones={zones}
            allSpots={allSpots}
            businesses={businesses}
            weather={weather}
            userWeather={userWeather}
            onSelectSpot={handleSelectSpot}
            onSelectBusiness={handleSelectBusiness}
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

      {selectedBusiness && createPortal(
        <BusinessModal
          business={selectedBusiness}
          onClose={handleCloseBusinessModal}
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

      {activeModal === 'private-experience' && createPortal(
        <PrivateExperienceModal onClose={handleCloseModal} />,
        document.body
      )}

      <Analytics />
    </div>
  );
}

export default App;
