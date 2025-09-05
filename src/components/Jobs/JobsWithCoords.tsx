import React, { useEffect, useState } from "react";
import { Job } from "../../types";
import { coordinateService } from "../../services/coordinateService";

interface JobsWithCoordsProps {
  jobs: Job[];
}

interface JobWithCoords extends Job {
  coords?: { lat: number; lng: number } | null;
}

export default function JobsWithCoords({ jobs }: JobsWithCoordsProps) {
  const [jobsWithCoords, setJobsWithCoords] = useState<JobWithCoords[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCoords() {
      if (jobs.length === 0) return;
      
      setLoading(true);
      try {
        const enriched = await Promise.all(
          jobs.map(async (job) => {
            if (job.customer?.address && job.customer?.city && job.customer?.state && job.customer?.zip_code) {
              const address = coordinateService.formatAddressForGeocoding(
                job.customer.address,
                job.customer.city,
                job.customer.state,
                job.customer.zip_code
              );
              const coords = await coordinateService.getLatLng(address);
              return { ...job, coords };
            }
            return { ...job, coords: null };
          })
        );
        setJobsWithCoords(enriched);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoords();
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Fetching coordinates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Jobs with Coordinates</h2>
      <div className="grid gap-4">
        {jobsWithCoords.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {job.customer?.name || job.customerName || 'Unknown Customer'}
                </h3>
                <p className="text-sm text-gray-600">
                  {job.customer?.address || job.address || 'N/A'}, {job.customer?.city || job.city || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {job.title || 'No title'}
                </p>
              </div>
              <div className="text-sm">
                {job.coords ? (
                  <div className="text-green-600">
                    <div>Lat: {job.coords.lat.toFixed(6)}</div>
                    <div>Lng: {job.coords.lng.toFixed(6)}</div>
                  </div>
                ) : (
                  <div className="text-red-600">No coordinates found</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
