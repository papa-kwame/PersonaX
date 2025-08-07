
import VehicleList from '../components/vehicles/VehicleList';

export default function Vehicles({ sidebarExpanded = true }) {
  return (
    <div className="vehicles-page">
    
 <VehicleList sidebarExpanded={sidebarExpanded}/>   
    </div>
  );
}