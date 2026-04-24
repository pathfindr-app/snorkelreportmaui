import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Layout/Header';
import MapView from './components/Map/MapView';
import SpotModal from './components/Modals/SpotModal';
import ReportModal from './components/Modals/ReportModal';
import BookingModal from './components/Modals/BookingModal';
import BusinessModal from './components/Modals/BusinessModal';
import { useConditions } from './hooks/useConditions';
import { useWeather } from './hooks/useWeather';
import businessesData from './data/businesses.json';

function App() {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const { zones, allSpots, loading, lastUpdated } = useConditions();
  const { weather, userWeather } = useWeather();
  const businesses = businessesData.businesses;

  const handleSelectSpot = useCallback((spot) => setSelectedSpot(spot), []);
  const handleCloseSpotModal = useCallback(() => setSelectedSpot(null), []);
  const handleSelectBusiness = useCallback((business) => setSelectedBusiness(business), []);
  const handleCloseBusinessModal = useCallback(() => setSelectedBusiness(null), []);
  const handleOpenReport = useCallback(() => setActiveModal('report'), []);
  const handleOpenBooking = useCallback(() => setActiveModal('booking'), []);
  const handleCloseModal = useCallback(() => setActiveModal(null), []);

  if (loading) {
    return (
      <div
        className="h-[100dvh] min-h-[100dvh] flex items-center justify-center site-shell"
      >
        <div className="text-center px-6">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: '2px solid transparent',
                borderTopColor: '#7fd4c8',
                animationDuration: '1.6s',
              }}
            />
            <div
              className="absolute inset-2 rounded-full animate-breathe"
              style={{
                background: 'radial-gradient(circle, rgba(127, 212, 200, 0.24) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-lg font-medium text-[#f2f4ef]">Loading today&apos;s reef report...</p>
          <p className="text-sm mt-2 text-[#9db1ad]">Checking Maui shoreline conditions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] overflow-hidden site-shell">
      <div className="absolute inset-x-0 top-0 z-50">
        <Header
          lastUpdated={lastUpdated}
          isMapView
          showBackButton={false}
        />
      </div>

      <main className="flex h-full min-h-0 overflow-hidden">
        <MapView
          zones={zones}
          allSpots={allSpots}
          businesses={businesses}
          weather={weather}
          userWeather={userWeather}
          onSelectSpot={handleSelectSpot}
          onSelectBusiness={handleSelectBusiness}
        />
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

      <Analytics />
    </div>
  );
}

export default App;
