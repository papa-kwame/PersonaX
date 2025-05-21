const mockVehicles = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: 'ABC123',
    vin: '1HGCM82633A123456',
    currentMileage: 45000,
    status: 'Available',
    purchaseDate: '2020-01-15',
    purchasePrice: 25000,
    color: 'Silver',
    fuelType: 'Gasoline',
    lastServiceDate: '2023-05-10',
    roadworthyExpiry: '2024-06-30',
    registrationExpiry: '2024-12-31',
    insuranceExpiry: '2024-12-31',
    nextServiceDue: '2023-11-15',
    serviceInterval: 10000,
    vehicleType: 'Sedan',
    seatingCapacity: 5,
    transmission: 'Automatic',
    engineSize: 2500,
    notes: 'Regular maintenance performed'
  },
  {
    id: '2',
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    licensePlate: 'DEF456',
    vin: '1FTFW1EF5BFA12345',
    currentMileage: 52000,
    status: 'Assigned',
    purchaseDate: '2019-03-20',
    purchasePrice: 35000,
    color: 'Black',
    fuelType: 'Gasoline',
    lastServiceDate: '2023-04-15',
    roadworthyExpiry: '2024-07-31',
    registrationExpiry: '2024-12-31',
    insuranceExpiry: '2024-12-31',
    nextServiceDue: '2023-10-15',
    serviceInterval: 10000,
    vehicleType: 'Truck',
    seatingCapacity: 5,
    transmission: 'Automatic',
    engineSize: 5000,
    notes: 'Used for delivery routes'
  },
  {
    id: '3',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    licensePlate: 'GHI789',
    vin: '2HGFC1F56MH123456',
    currentMileage: 25000,
    status: 'Available',
    purchaseDate: '2021-02-10',
    purchasePrice: 22000,
    color: 'Blue',
    fuelType: 'Gasoline',
    lastServiceDate: '2023-06-01',
    roadworthyExpiry: '2025-01-31',
    registrationExpiry: '2025-02-28',
    insuranceExpiry: '2025-02-28',
    nextServiceDue: '2023-12-01',
    serviceInterval: 10000,
    vehicleType: 'Sedan',
    seatingCapacity: 5,
    transmission: 'Automatic',
    engineSize: 2000,
    notes: 'Low mileage, excellent condition'
  },
  {
    id: '4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    licensePlate: 'JKL012',
    vin: '5YJ3E1EA0NF123456',
    currentMileage: 8000,
    status: 'In Maintenance',
    purchaseDate: '2022-01-05',
    purchasePrice: 45000,
    color: 'Red',
    fuelType: 'Electric',
    lastServiceDate: '2023-05-20',
    roadworthyExpiry: '2025-03-31',
    registrationExpiry: '2025-01-05',
    insuranceExpiry: '2025-01-05',
    nextServiceDue: '2024-01-20',
    serviceInterval: 15000,
    vehicleType: 'Sedan',
    seatingCapacity: 5,
    transmission: 'Automatic',
    engineSize: 0,
    notes: 'Battery maintenance required'
  },
  {
    id: '5',
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2018,
    licensePlate: 'MNO345',
    vin: '3GCUKREC5JG123456',
    currentMileage: 65000,
    status: 'Available',
    purchaseDate: '2018-11-15',
    purchasePrice: 38000,
    color: 'White',
    fuelType: 'Diesel',
    lastServiceDate: '2023-03-25',
    roadworthyExpiry: '2024-09-30',
    registrationExpiry: '2024-11-15',
    insuranceExpiry: '2024-11-15',
    nextServiceDue: '2023-09-25',
    serviceInterval: 10000,
    vehicleType: 'Truck',
    seatingCapacity: 5,
    transmission: 'Automatic',
    engineSize: 6000,
    notes: 'Durable heavy-duty truck'
  }
];

let vehicles = [...mockVehicles];

export const getVehicles = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...vehicles]), 500);
  });
};

export const getVehicleById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        resolve({...vehicle});
      } else {
        reject(new Error('Vehicle not found'));
      }
    }, 500);
  });
};

export const deleteVehicle = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      vehicles = vehicles.filter(v => v.id !== id);
      resolve();
    }, 500);
  });
};

export const updateVehicle = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = vehicles.findIndex(v => v.id === id);
      if (index >= 0) {
        vehicles[index] = {...vehicles[index], ...data};
        resolve(vehicles[index]);
      } else {
        reject(new Error('Vehicle not found'));
      }
    }, 500);
  });
};

export const createVehicle = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newVehicle = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        currentMileage: parseInt(data.currentMileage) || 0,
        purchasePrice: parseFloat(data.purchasePrice) || 0,
        serviceInterval: parseInt(data.serviceInterval) || 10000,
        seatingCapacity: parseInt(data.seatingCapacity) || 5,
        engineSize: parseInt(data.engineSize) || 0
      };
      vehicles.push(newVehicle);
      resolve(newVehicle);
    }, 500);
  });
};

// New utility functions
export const getVehiclesWithExpiredDocuments = () => {
  const today = new Date().toISOString().split('T')[0];
  return vehicles.filter(v => 
    v.roadworthyExpiry < today || 
    v.registrationExpiry < today || 
    v.insuranceExpiry < today
  );
};

export const getVehiclesDueForService = () => {
  const today = new Date().toISOString().split('T')[0];
  return vehicles.filter(v => v.nextServiceDue <= today);
};