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
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('create', 'добавление ТС') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message, errors: {} };
      }

      const validation = App.validateVehicle(rawData);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const sanitize = App.fleetSecurity ? App.fleetSecurity.sanitizeText : (v) => String(v || '').trim();
      const created = App.fleetStore.add({
        brandModel: sanitize(rawData.brandModel),
        plateNumber: sanitize(rawData.plateNumber).toUpperCase(),
        year: Number(rawData.year),
        mileage: Number(rawData.mileage),
        status: rawData.status || 'Свободен',
        lastServiceDate: rawData.lastServiceDate
      });

      return { success: true, vehicle: created };
    },

    updateVehicle(id, rawData) {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('edit', 'редактирование ТС') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message, errors: {} };
      }

      const validation = App.validateVehicle(rawData, true);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const sanitize = App.fleetSecurity ? App.fleetSecurity.sanitizeText : (v) => String(v || '').trim();
      const updated = App.fleetStore.update(id, {
        brandModel: sanitize(rawData.brandModel),
        plateNumber: sanitize(rawData.plateNumber).toUpperCase(),
        year: Number(rawData.year),
        mileage: Number(rawData.mileage),
        status: rawData.status,
        lastServiceDate: rawData.lastServiceDate
      });

      return { success: true, vehicle: updated };
    },

    changeVehicleStatus(id, status) {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('status', 'изменение статуса ТС') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message };
      }
      return { success: true, vehicle: App.fleetStore.updateStatus(id, status) };
    },

    deleteVehicle(id) {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('delete', 'удаление ТС из реестра') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message };
      }
      const existing = App.fleetStore.getById(id);
      if (existing && existing.status === 'В рейсе') {
        const msg = `Запрещено удаление ТС «${existing.brandModel}» (${existing.plateNumber}): автомобиль находится в рейсе`;
        if (App.fleetSecurity) App.fleetSecurity.logEvent('INTEGRITY_GUARD', msg);
        return { success: false, message: msg };
      }
      return { success: true, removed: App.fleetStore.remove(id) };
    },

    getVehicleById(id) {
      return App.fleetStore.getById(id);
    },

    // --- DRIVERS ---
    getDrivers() {
      return App.fleetStore.getDrivers();
    },

    changeDriverStatus(id, status) {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('status', 'изменение статуса водителя') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message };
      }
      return { success: true, driver: App.fleetStore.updateDriverStatus(id, status) };
    },

    addDriver(rawData) {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('create', 'добавление водителя') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message, errors: {} };
      }

      const validation = App.validateDriver(rawData);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const sanitize = App.fleetSecurity ? App.fleetSecurity.sanitizeText : (v) => String(v || '').trim();
      const created = App.fleetStore.addDriver({
        fullName: sanitize(rawData.fullName),
        licenseNumber: sanitize(rawData.licenseNumber),
        categories: sanitize(rawData.categories).toUpperCase(),
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
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('create', 'оформление путевого листа') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message, errors: {} };
      }

      const validation = App.validateWaybill(data);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const km = Number(data.shiftMileage);
      const fuel = Math.round((km * 0.13) * 10) / 10;
      const sanitize = App.fleetSecurity ? App.fleetSecurity.sanitizeText : (v) => String(v || '').trim();

      const created = App.fleetStore.addWaybill({
        driverName: data.driverName,
        vehiclePlate: data.vehiclePlate,
        route: sanitize(data.route),
        shiftMileage: km,
        fuelUsed: fuel
      });

      return { success: true, waybill: created };
    },

    closeWaybill(id) {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('status', 'закрытие путевого листа') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message };
      }
      const existing = App.fleetStore.getWaybills().find((w) => String(w.id) === String(id));
      if (existing && existing.status === 'Закрыт') {
        const msg = `Путевой лист ${existing.number} уже закрыт`;
        if (App.fleetSecurity) App.fleetSecurity.logEvent('INTEGRITY_GUARD', msg);
        return { success: false, message: msg };
      }
      return { success: true, waybill: App.fleetStore.closeWaybill(id) };
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
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('reset', 'полный сброс базы данных') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message };
      }
      App.fleetStore.resetAll();
      return { success: true };
    },

    exportData() {
      const guard = App.fleetSecurity ? App.fleetSecurity.requirePermission('export', 'экспорт резервной копии JSON') : { allowed: true };
      if (!guard.allowed) {
        return { success: false, message: guard.message };
      }
      return { success: true, data: App.fleetStore.exportData() };
    }
  };
})(window.AutoPark = window.AutoPark || {});
