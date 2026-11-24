(function (App) {
  const STORAGE_KEYS = {
    VEHICLES: 'autopark_vehicles_v2',
    DRIVERS: 'autopark_drivers_v2',
    WAYBILLS: 'autopark_waybills_v2',
    MAINTENANCE: 'autopark_maintenance_v2'
  };

  const initialVehicles = [
    {
      id: 1,
      brandModel: 'ГАЗель Next',
      plateNumber: 'А142ВС 102',
      year: 2022,
      mileage: 68400,
      status: 'В рейсе',
      lastServiceDate: '2026-10-12'
    },
    {
      id: 2,
      brandModel: 'КАМАЗ 5490',
      plateNumber: 'Е508КМ 102',
      year: 2021,
      mileage: 194200,
      status: 'В рейсе',
      lastServiceDate: '2026-09-25'
    },
    {
      id: 3,
      brandModel: 'Hyundai Solaris',
      plateNumber: 'М771ОР 102',
      year: 2023,
      mileage: 41350,
      status: 'Свободен',
      lastServiceDate: '2026-11-04'
    },
    {
      id: 4,
      brandModel: 'Lada Largus',
      plateNumber: 'К319ТА 102',
      year: 2020,
      mileage: 112800,
      status: 'На ТО',
      lastServiceDate: '2026-11-18'
    },
    {
      id: 5,
      brandModel: 'Ford Transit',
      plateNumber: 'О890УН 102',
      year: 2021,
      mileage: 135600,
      status: 'Свободен',
      lastServiceDate: '2026-10-29'
    },
    {
      id: 6,
      brandModel: 'Volkswagen Polo',
      plateNumber: 'Х205ЕЕ 102',
      year: 2022,
      mileage: 57900,
      status: 'Свободен',
      lastServiceDate: '2026-10-03'
    }
  ];

  const initialDrivers = [
    {
      id: 1,
      fullName: 'Иванов Сергей Петрович',
      licenseNumber: '02 14 582910',
      categories: 'B, C, D',
      experienceYears: 14,
      assignedVehicle: 'КАМАЗ 5490 (Е508КМ 102)',
      status: 'На линии'
    },
    {
      id: 2,
      fullName: 'Смирнов Алексей Дмитриевич',
      licenseNumber: '02 08 391204',
      categories: 'B, C',
      experienceYears: 9,
      assignedVehicle: 'ГАЗель Next (А142ВС 102)',
      status: 'На линии'
    },
    {
      id: 3,
      fullName: 'Кузнецов Михаил Андреевич',
      licenseNumber: '02 19 847291',
      categories: 'B',
      experienceYears: 6,
      assignedVehicle: 'Hyundai Solaris (М771ОР 102)',
      status: 'Свободен'
    },
    {
      id: 4,
      fullName: 'Васильев Руслан Ильдарович',
      licenseNumber: '02 22 109283',
      categories: 'B, C, E',
      experienceYears: 18,
      assignedVehicle: 'Ford Transit (О890УН 102)',
      status: 'Свободен'
    },
    {
      id: 5,
      fullName: 'Гарипов Азат Радикович',
      licenseNumber: '02 11 639201',
      categories: 'B',
      experienceYears: 4,
      assignedVehicle: 'Lada Largus (К319ТА 102)',
      status: 'В отпуске'
    }
  ];

  const initialWaybills = [
    {
      id: 1,
      number: 'ПЛ-00101',
      date: '2026-11-24',
      driverName: 'Иванов Сергей Петрович',
      vehiclePlate: 'Е508КМ 102 (КАМАЗ 5490)',
      route: 'Уфа – Стерлитамак – Уфа',
      shiftMileage: 260,
      fuelUsed: 78.0,
      status: 'Закрыт'
    },
    {
      id: 2,
      number: 'ПЛ-00102',
      date: '2026-11-24',
      driverName: 'Смирнов Алексей Дмитриевич',
      vehiclePlate: 'А142ВС 102 (ГАЗель Next)',
      route: 'Уфа (городская логистика)',
      shiftMileage: 145,
      fuelUsed: 18.8,
      status: 'Открыт'
    },
    {
      id: 3,
      number: 'ПЛ-00103',
      date: '2026-11-23',
      driverName: 'Васильев Руслан Ильдарович',
      vehiclePlate: 'О890УН 102 (Ford Transit)',
      route: 'Уфа – Благовещенск',
      shiftMileage: 95,
      fuelUsed: 11.4,
      status: 'Закрыт'
    }
  ];

  const initialMaintenance = [
    {
      id: 1,
      vehiclePlate: 'К319ТА 102 (Lada Largus)',
      serviceType: 'Плановое ТО-2, замена масла и ГРМ',
      serviceDate: '2026-11-18',
      contractor: 'ООО «АвтоТехЦентр Уфа»',
      cost: 18500,
      status: 'В ремонте'
    },
    {
      id: 2,
      vehiclePlate: 'М771ОР 102 (Hyundai Solaris)',
      serviceType: 'Замена тормозных колодок и дисков',
      serviceDate: '2026-11-04',
      contractor: 'Сервисный центр «Транзит»',
      cost: 12400,
      status: 'Завершено'
    },
    {
      id: 3,
      vehiclePlate: 'Е508КМ 102 (КАМАЗ 5490)',
      serviceType: 'Диагностика пневмосистемы и замена фильтров',
      serviceDate: '2026-09-25',
      contractor: 'ООО «КАМАЗ Центр Уфа»',
      cost: 34200,
      status: 'Завершено'
    }
  ];

  function loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage load error for', key, e);
    }
    saveToStorage(key, fallback);
    return fallback.map(item => ({ ...item }));
  }

  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error for', key, e);
    }
  }

  let vehicles = loadFromStorage(STORAGE_KEYS.VEHICLES, initialVehicles);
  let drivers = loadFromStorage(STORAGE_KEYS.DRIVERS, initialDrivers);
  let waybills = loadFromStorage(STORAGE_KEYS.WAYBILLS, initialWaybills);
  let maintenance = loadFromStorage(STORAGE_KEYS.MAINTENANCE, initialMaintenance);

  function getNextId(collection) {
    if (!collection.length) return 1;
    return Math.max(...collection.map(item => Number(item.id) || 0)) + 1;
  }

  App.fleetStore = {
    // --- VEHICLES (CRUD) ---
    getAll() {
      return vehicles.map(item => ({ ...item }));
    },

    getById(id) {
      const found = vehicles.find(item => item.id === Number(id));
      return found ? { ...found } : null;
    },

    add(vehicleData) {
      const newVehicle = {
        id: getNextId(vehicles),
        ...vehicleData
      };
      vehicles.unshift(newVehicle);
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return { ...newVehicle };
    },

    update(id, updatedData) {
      const index = vehicles.findIndex(item => item.id === Number(id));
      if (index === -1) return null;
      vehicles[index] = {
        ...vehicles[index],
        ...updatedData,
        id: Number(id)
      };
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return { ...vehicles[index] };
    },

    updateStatus(id, newStatus) {
      const target = vehicles.find(item => item.id === Number(id));
      if (!target) return null;
      target.status = newStatus;
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return { ...target };
    },

    remove(id) {
      const initialLength = vehicles.length;
      vehicles = vehicles.filter(item => item.id !== Number(id));
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      return vehicles.length < initialLength;
    },

    // --- DRIVERS ---
    getDrivers() {
      return drivers.map(item => ({ ...item }));
    },

    updateDriverStatus(id, newStatus) {
      const target = drivers.find(item => item.id === Number(id));
      if (!target) return null;
      target.status = newStatus;
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      return { ...target };
    },

    addDriver(driverData) {
      const newDriver = {
        id: getNextId(drivers),
        ...driverData
      };
      drivers.unshift(newDriver);
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      return { ...newDriver };
    },

    // --- WAYBILLS ---
    getWaybills() {
      return waybills.map(item => ({ ...item }));
    },

    addWaybill(data) {
      const newBill = {
        id: getNextId(waybills),
        number: `ПЛ-${String(100 + waybills.length + 1).padStart(5, '0')}`,
        date: data.date || new Date().toISOString().slice(0, 10),
        ...data,
        status: 'Открыт'
      };
      waybills.unshift(newBill);
      saveToStorage(STORAGE_KEYS.WAYBILLS, waybills);
      return { ...newBill };
    },

    closeWaybill(id) {
      const target = waybills.find(item => item.id === Number(id));
      if (!target) return null;
      target.status = 'Закрыт';
      saveToStorage(STORAGE_KEYS.WAYBILLS, waybills);
      return { ...target };
    },

    // --- MAINTENANCE ---
    getMaintenance() {
      return maintenance.map(item => ({ ...item }));
    },

    // --- UTILITIES & STORAGE RESET ---
    resetAll() {
      vehicles = initialVehicles.map(item => ({ ...item }));
      drivers = initialDrivers.map(item => ({ ...item }));
      waybills = initialWaybills.map(item => ({ ...item }));
      maintenance = initialMaintenance.map(item => ({ ...item }));

      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      saveToStorage(STORAGE_KEYS.WAYBILLS, waybills);
      saveToStorage(STORAGE_KEYS.MAINTENANCE, maintenance);
    },

    exportData() {
      return {
        timestamp: new Date().toISOString(),
        system: 'АвтоПарк-Контроль',
        version: '2.4.0',
        vehicles,
        drivers,
        waybills,
        maintenance
      };
    }
  };
})(window.AutoPark = window.AutoPark || {});
