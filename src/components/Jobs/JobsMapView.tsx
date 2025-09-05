import React, { useEffect, useRef, useState } from 'react';
import { loadModules } from 'esri-loader';
import { Job } from '../../types';
import {
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ExternalLink,
  X,
  Play,
  RotateCcw
} from 'lucide-react';

interface JobsMapViewProps {
  jobs: Job[];
  onJobSelect?: (job: Job) => void;
}

interface JobWithCoordinates extends Job {
  latitude: number;
  longitude: number;
}

// Extend Window interface for global function
declare global {
  interface Window {
    updateMarkers?: () => void;
  }
}

const JobsMapView: React.FC<JobsMapViewProps> = ({ jobs, onJobSelect }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<__esri.MapView | null>(null);
  const mapRef2 = useRef<__esri.Map | null>(null);
  const graphicsLayerRef = useRef<__esri.GraphicsLayer | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithCoordinates | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get saved map state from localStorage or use defaults
  const getSavedMapState = () => {
    try {
      const saved = localStorage.getItem('jobsMapState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          center: parsed.center || [-77.9447, 34.2257],
          zoom: parsed.zoom || 12
        };
      }
    } catch (error) {
      console.warn('Error loading map state from localStorage:', error);
    }
    return {
      center: [-77.9447, 34.2257] as [number, number], // Wilmington, NC coordinates
      zoom: 12
    };
  };

  // Save map state to localStorage
  const saveMapState = (center: [number, number], zoom: number) => {
    try {
      localStorage.setItem('jobsMapState', JSON.stringify({ center, zoom }));
    } catch (error) {
      console.warn('Error saving map state to localStorage:', error);
    }
  };

  // Reset map to default view
  const resetMapView = () => {
    if (mapInstanceRef.current) {
      const defaultCenter: [number, number] = [-77.9447, 34.2257]; // Wilmington, NC
      const defaultZoom = 12;

      mapInstanceRef.current.goTo({
        center: defaultCenter,
        zoom: defaultZoom
      });

      saveMapState(defaultCenter, defaultZoom);
    }
  };

  // Filter jobs that have coordinates
  const jobsWithCoordinates = jobs.filter(job =>
    (job as JobWithCoordinates).latitude && (job as JobWithCoordinates).longitude
  ) as JobWithCoordinates[];

  const filteredJobs = jobsWithCoordinates.filter(job =>
    statusFilter === 'all' || job.status === statusFilter
  );

  const handleOpenModal = (job: JobWithCoordinates) => {
    setSelectedJob(job);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJob(null);
  };

  const handleGoogleMaps = (job: JobWithCoordinates) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    // All markers are blue
    return [59, 130, 246]; // blue
  };

  useEffect(() => {
    // Only initialize map if it doesn't exist
    if (mapInstanceRef.current) {
      // Map already exists, just update markers
      if (window.updateMarkers) {
        window.updateMarkers();
      }
      return;
    }

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/Graphic',
      'esri/layers/GraphicsLayer',
      'esri/geometry/Point',
      'esri/symbols/SimpleMarkerSymbol',
    ], { css: true })
      .then(([
        Map,
        MapView,
        Graphic,
        GraphicsLayer,
        Point,
        SimpleMarkerSymbol,
      ]) => {
        // Create map
        const map = new Map({
          basemap: 'streets-vector',
        });

        // Get saved map state
        const savedState = getSavedMapState();

        // Create view
        const view = new MapView({
          container: mapRef.current as HTMLDivElement,
          map: map,
          center: savedState.center,
          zoom: savedState.zoom,
        });

        // Create graphics layer for job markers
        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);

        // Store references
        mapInstanceRef.current = view;
        mapRef2.current = map;
        graphicsLayerRef.current = graphicsLayer;

        // Add job markers function
        const addJobMarkers = () => {
          if (!graphicsLayerRef.current) return;

          // Clear existing graphics
          graphicsLayerRef.current.removeAll();

          filteredJobs.forEach((job) => {
            const point = new Point({
              longitude: job.longitude,
              latitude: job.latitude,
            });

            const color = getStatusColor(job.status);
            const symbol = new SimpleMarkerSymbol({
              color: color,
              size: '22px',
              outline: {
                color: color,
                width: 2,
              },
            });

            const graphic = new Graphic({
              geometry: point,
              symbol: symbol,
              attributes: job,
            });

            graphicsLayerRef.current!.add(graphic);
          });
        };

        // Store update function globally
        window.updateMarkers = addJobMarkers;

        // Add initial markers
        addJobMarkers();

        // Handle click events
        view.on('click', (event: any) => {
          view.hitTest(event).then((response: any) => {
            const results = response.results.filter(
              (result: any) => result.graphic.layer === graphicsLayerRef.current
            );
            if (results.length > 0) {
              const graphic = results[0].graphic;
              handleOpenModal(graphic.attributes as JobWithCoordinates);
            }
          });
        });

        // Save map state when view changes
        view.watch('center,zoom', (newValue: any) => {
          if (newValue && newValue.center && typeof newValue.center.longitude === 'number' && typeof newValue.center.latitude === 'number') {
            const center: [number, number] = [newValue.center.longitude, newValue.center.latitude];
            const zoom = newValue.zoom || 12;
            saveMapState(center, zoom);
          }
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('ArcGIS API error:', err);
        setLoading(false);
      });

    // Cleanup function
    return () => {
      // Don't destroy the map when component unmounts, just clean up markers
    };
  }, []); // Empty dependency array - only run once

  // Separate effect for updating markers when jobs or filter changes
  useEffect(() => {
    if (window.updateMarkers) {
      window.updateMarkers();
    }
  }, [filteredJobs, statusFilter]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        mapRef2.current = null;
        graphicsLayerRef.current = null;
        window.updateMarkers = undefined;
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Filters Panel */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 max-w-xs sm:max-w-none">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">Filters</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-2 sm:space-y-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>All Jobs</span>
                </div>
              </div>

              <button
                onClick={resetMapView}
                className="w-full flex items-center justify-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Reset Map View</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="w-full h-[calc(100vh-300px)] sm:h-[calc(100vh-200px)] rounded-lg shadow-lg bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Jobs to Display</p>
              <p className="text-sm">Create your first job to see it on the map</p>
            </div>
          </div>
        ) : (
          <div
            ref={mapRef}
            className="w-full h-[calc(100vh-300px)] sm:h-[calc(100vh-200px)] rounded-lg shadow-lg"
          ></div>
        )}
      </div>

      {/* Job Details Modal */}
      {openModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-sm sm:max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {selectedJob.customerName}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{selectedJob.address}, {selectedJob.city}, {selectedJob.state}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedJob.scheduledDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{selectedJob.timeSlot}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>${selectedJob.totalEstimate.toLocaleString()}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="capitalize">{selectedJob.status.replace('-', ' ')}</span>
              </div>

              {selectedJob.notes && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Notes:</p>
                  <p className="break-words">{selectedJob.notes}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3 sm:pt-4">
                <button
                  onClick={() => handleGoogleMaps(selectedJob)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </button>
                {onJobSelect && (
                  <button
                    onClick={() => {
                      onJobSelect(selectedJob);
                      handleCloseModal();
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>Track Progress</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsMapView;
