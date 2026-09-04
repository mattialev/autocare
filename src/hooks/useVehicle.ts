import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const useVehicle = () => {
  const { vehicleId } = useParams();
  const { data } = useApp();
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  return { vehicleId, vehicle };
};
