(function (App) {
  App.fleetService = {
    getFilteredVehicles({ search = '', status = 'all' } = {}) {
      const query = search.trim().toLowerCase();

      return App.fleetStore.getAll().filter((vehicle) => {
        const matchesStatus = status === 'all' || vehicle.status === status;
        const matchesQuery =
          !query ||
          vehicle.brandModel.toLowerCase().includes(query) ||
          vehicle.plateNumber.toLowerCase().includes(query);

        return matchesStatus && matchesQuery;
      });
    },

    getStats() {
      const all = App.fleetStore.getAll();
      const total = all.length;
      const available = all.filter((v) => v.status === 'Свободен').length;
      const inRoute = all.filter((v) => v.status === 'В рейсе').length;
      const inService = all.filter((v) => v.status === 'На ТО').length;
      const totalMileage = all.reduce((sum, v) => sum + v.mileage, 0);
      const readiness = total > 0 ? Math.round(((total - inService) / total) * 100) : 100;

      return {
        total,
        available,
        inRoute,
        inService,
        totalMileage,
        readiness
      };
    },

    getDriverStats() {
      const drivers = App.fleetStore.getDrivers();
      return {
        total: drivers.length,
        onLine: drivers.filter(d => d.status === 'На линии').length,
        available: drivers.filter(d => d.status === 'Свободен').length,
        onVacation: drivers.filter(d => d.status === 'В отпуске').length
      };
    },

    addVehicle(rawData) {
      const validation = App.validateVehicle(rawData);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const created = App.fleetStore.add({
        brandModel: rawData.brandModel.trim(),
        plateNumber: rawData.plateNumber.trim().toUpperCase(),
        year: Number(rawData.year),
        mileage: Number(rawData.mileage),
        status: rawData.status || 'Свободен',
        lastServiceDate: rawData.lastServiceDate
      });

      return { success: true, vehicle: created };
    },

    updateVehicle(id, rawData) {
      const validation = App.validateVehicle(rawData, true);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const updated = App.fleetStore.update(id, {
        brandModel: rawData.brandModel.trim(),
        plateNumber: rawData.plateNumber.trim().toUpperCase(),
        year: Number(rawData.year),
        mileage: Number(rawData.mileage),
        status: rawData.status,
        lastServiceDate: rawData.lastServiceDate
      });

      return { success: true, vehicle: updated };
    },

    changeVehicleStatus(id, status) {
      return App.fleetStore.updateStatus(id, status);
    },

    deleteVehicle(id) {
      return App.fleetStore.remove(id);
    },

    getVehicleById(id) {
      return App.fleetStore.getById(id);
    },

    // --- DRIVERS ---
    getDrivers() {
      return App.fleetStore.getDrivers();
    },

    changeDriverStatus(id, status) {
      return App.fleetStore.updateDriverStatus(id, status);
    },

    addDriver(rawData) {
      const validation = App.validateDriver(rawData);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const created = App.fleetStore.addDriver({
        fullName: rawData.fullName.trim(),
        licenseNumber: rawData.licenseNumber.trim(),
        categories: rawData.categories.trim().toUpperCase(),
        experienceYears: Number(rawData.experienceYears),
        assignedVehicle: rawData.assignedVehicle || 'Не закреплён',
        status: rawData.status || 'Свободен'
      });

      return { success: true, driver: created };
    },

    // --- WAYBILLS ---
    getWaybills() {
      return App.fleetStore.getWaybills();
    },

    createWaybill(data) {
      const validation = App.validateWaybill(data);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const km = Number(data.shiftMileage);
      const fuel = Math.round((km * 0.13) * 10) / 10;

      const created = App.fleetStore.addWaybill({
        driverName: data.driverName,
        vehiclePlate: data.vehiclePlate,
        route: data.route.trim(),
        shiftMileage: km,
        fuelUsed: fuel
      });

      return { success: true, waybill: created };
    },

    closeWaybill(id) {
      return App.fleetStore.closeWaybill(id);
    },

    // --- MAINTENANCE ---
    getMaintenance() {
      return App.fleetStore.getMaintenance();
    },

    // --- ANALYTICS ---
    getAnalytics() {
      const vehicles = App.fleetStore.getAll();
      const waybills = App.fleetStore.getWaybills();
      const maintenance = App.fleetStore.getMaintenance();

      const totalWaybillKm = waybills.reduce((sum, w) => sum + (Number(w.shiftMileage) || 0), 0);
      const totalFuelLiters = waybills.reduce((sum, w) => sum + (Number(w.fuelUsed) || 0), 0);
      const totalFuelCostRub = Math.round(totalFuelLiters * 62.5); // 62.50 руб/л АИ-92/ДТ
      const totalMaintenanceCostRub = maintenance.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);

      return {
        totalWaybillKm,
        totalFuelLiters: Math.round(totalFuelLiters * 10) / 10,
        totalFuelCostRub,
        totalMaintenanceCostRub,
        totalOperationalExpenses: totalFuelCostRub + totalMaintenanceCostRub,
        avgMileagePerVehicle: vehicles.length ? Math.round(vehicles.reduce((s, v) => s + v.mileage, 0) / vehicles.length) : 0
      };
    },

    resetAllData() {
      App.fleetStore.resetAll();
    },

    exportData() {
      return App.fleetStore.exportData();
    }
  };
})(window.AutoPark = window.AutoPark || {});
