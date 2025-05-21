import React from 'react';

const VehicleCard = ({ vehicle, onUnassign, isUnassigning }) => {
    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 className="card-title mb-1">
                            {vehicle.make} {vehicle.model}
                        </h5>
                        <h6 className="card-subtitle text-muted mb-3">
                            {vehicle.year}
                        </h6>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(vehicle.status)}`}>
                        {vehicle.status}
                    </span>
                </div>

                <ul className="list-group list-group-flush border-top mt-2">
                    <li className="list-group-item d-flex justify-content-between">
                        <span className="text-muted">License Plate</span>
                        <strong>{vehicle.licensePlate}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                        <span className="text-muted">Type</span>
                        <strong>{vehicle.vehicleType}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                        <span className="text-muted">Mileage</span>
                        <strong>{vehicle.mileage?.toLocaleString() || 'N/A'} mi</strong>
                    </li>
                </ul>
            </div>
            <div className="card-footer bg-transparent border-0">
                <button
                    onClick={() => onUnassign(vehicle.id)}
                    disabled={isUnassigning}
                    className="btn btn-outline-danger w-100"
                >
                    {isUnassigning ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                        <i className="bi bi-x-circle me-2"></i>
                    )}
                    Unassign Vehicle
                </button>
            </div>
        </div>
    );
};

function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
        case 'active': return 'bg-success';
        case 'maintenance': return 'bg-warning text-dark';
        case 'out_of_service': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

export default VehicleCard;