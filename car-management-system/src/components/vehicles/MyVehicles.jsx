import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Adjust path if necessary

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('api/VehicleAssignment/MyVehicles');
        setVehicles(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicles.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) return <div className="p-4 text-blue-500">Loading vehicles...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Vehicles</h2>
      {vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h3>
              <p>License Plate: {vehicle.licensePlate}</p>
              <p>Type: {vehicle.vehicleType}</p>
              <p>Status: <span className="font-medium">{vehicle.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVehicles;
