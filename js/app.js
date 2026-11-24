(function (App) {
  const { fleetService, fleetRenderer } = App;

  let activeTab = 'vehicles';

  const filterState = {
    search: '',
    status: 'all'
  };

  const TAB_HEADERS = {
    vehicles: {
      title: 'Реестр транспортных средств',
      subtitle: 'АВТОПАРК-КОНТРОЛЬ · УФА · МОДУЛЬ УЧЁТА ТРАНСПОРТНЫХ СРЕДСТВ'
    },
    drivers: {
      title: 'Водительский состав',
      subtitle: 'АВТОПАРК-КОНТРОЛЬ · УФА · КАДРЫ И ДОПУСКИ ВОДИТЕЛЕЙ'
    },
    waybills: {
      title: 'Журнал путевых листов',
      subtitle: 'АВТОПАРК-КОНТРОЛЬ · УФА · РЕЙСЫ И РАСЧЁТ РАСХОДА ГСМ'
    },
    maintenance: {
      title: 'Техобслуживание и ремонты',
      subtitle: 'АВТОПАРК-КОНТРОЛЬ · УФА · РЕГЛАМЕНТНЫЕ РАБОТЫ И СТО'
    },
    analytics: {
      title: 'Аналитика и эксплуатация ГСМ',
      subtitle: 'АВТОПАРК-КОНТРОЛЬ · УФА · СВОДНЫЕ ПОКАЗАТЕЛИ ЭФФЕКТИВНОСТИ'
    }
  };

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const addVehicleForm = document.getElementById('addVehicleForm');
  const fleetTableBody = document.getElementById('fleetTableBody');

  const headerPageTitle = document.getElementById('headerPageTitle');
  const headerPageSubtitle = document.getElementById('headerPageSubtitle');

  const editVehicleModal = document.getElementById('editVehicleModal');
  const editVehicleForm = document.getElementById('editVehicleForm');
  const addWaybillModal = document.getElementById('addWaybillModal');
  const addWaybillForm = document.getElementById('addWaybillForm');
  const addDriverModal = document.getElementById('addDriverModal');
  const addDriverForm = document.getElementById('addDriverForm');

  const btnExportJson = document.getElementById('btnExportJson');
  const btnResetData = document.getElementById('btnResetData');
  const btnOpenWaybillModal = document.getElementById('btnOpenWaybillModal');
  const btnOpenDriverModal = document.getElementById('btnOpenDriverModal');
  const btnHeaderQuickWaybill = document.getElementById('btnHeaderQuickWaybill');

  const navTabs = document.querySelectorAll('.nav-tab');
  const tabSections = document.querySelectorAll('.tab-section');

  function switchTab(tabId) {
    activeTab = tabId;
    navTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    tabSections.forEach((section) => {
      section.classList.toggle('active', section.id === `section-${tabId}`);
    });
    const meta = TAB_HEADERS[tabId];
    if (meta) {
      if (headerPageTitle) headerPageTitle.textContent = meta.title;
      if (headerPageSubtitle) headerPageSubtitle.textContent = meta.subtitle;
    }
    refreshActiveTab();
  }

  function refreshVehiclesUI() {
    const stats = fleetService.getStats();
    const visibleVehicles = fleetService.getFilteredVehicles(filterState);
    fleetRenderer.renderStats(stats);
    fleetRenderer.renderTable(visibleVehicles);
  }

  function refreshDriversUI() {
    const drivers = fleetService.getDrivers();
    const stats = fleetService.getDriverStats();
    fleetRenderer.renderDrivers(drivers);
    fleetRenderer.renderDriverStats(stats);
  }

  function refreshWaybillsUI() {
    const waybills = fleetService.getWaybills();
    fleetRenderer.renderWaybills(waybills);
    populateWaybillDropdowns();
  }

  function refreshMaintenanceUI() {
    const maintenance = fleetService.getMaintenance();
    fleetRenderer.renderMaintenance(maintenance);
  }

  function refreshAnalyticsUI() {
    const analytics = fleetService.getAnalytics();
    const fleetStats = fleetService.getStats();
    fleetRenderer.renderAnalytics(analytics, fleetStats);
  }

  function refreshSidebarCounters() {
    fleetRenderer.renderStats(fleetService.getStats());
    const navDrivers = document.getElementById('navDriversCount');
    const navWb = document.getElementById('navWaybillsCount');
    if (navDrivers) navDrivers.textContent = fleetService.getDrivers().length;
    if (navWb) navWb.textContent = fleetService.getWaybills().length;
  }

  function refreshActiveTab() {
    if (activeTab === 'vehicles') refreshVehiclesUI();
    else if (activeTab === 'drivers') refreshDriversUI();
    else if (activeTab === 'waybills') refreshWaybillsUI();
    else if (activeTab === 'maintenance') refreshMaintenanceUI();
    else if (activeTab === 'analytics') refreshAnalyticsUI();
    refreshSidebarCounters();
  }

  function populateWaybillDropdowns() {
    const driverSelect = document.getElementById('wbDriverSelect');
    const vehicleSelect = document.getElementById('wbVehicleSelect');
    if (!driverSelect || !vehicleSelect) return;

    const drivers = fleetService.getDrivers();
    const vehicles = fleetService.getFilteredVehicles({ status: 'all' });

    driverSelect.innerHTML = '<option value="">-- Выберите водителя --</option>' +
      drivers.map(d => `<option value="${d.fullName}">${d.fullName} (${d.status})</option>`).join('');

    vehicleSelect.innerHTML = '<option value="">-- Выберите автомобиль --</option>' +
      vehicles.map(v => `<option value="${v.plateNumber} (${v.brandModel})">${v.brandModel} [${v.plateNumber}]</option>`).join('');
  }

  function populateDriverVehicleDropdown() {
    const select = document.getElementById('driverAssignedVehicle');
    if (!select) return;
    const vehicles = fleetService.getFilteredVehicles({ status: 'all' });
    select.innerHTML = '<option value="Не закреплён">Не закреплён</option>' +
      vehicles.map(v => `<option value="${v.brandModel} (${v.plateNumber})">${v.brandModel} (${v.plateNumber})</option>`).join('');
  }

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      filterState.search = event.target.value;
      refreshVehiclesUI();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (event) => {
      filterState.status = event.target.value;
      refreshVehiclesUI();
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      filterState.search = '';
      filterState.status = 'all';
      statusFilter.value = 'all';
      if (searchInput) searchInput.value = '';
      refreshVehiclesUI();
    });
  }

  if (addVehicleForm) {
    addVehicleForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(addVehicleForm);
      const payload = {
        brandModel: formData.get('brandModel'),
        plateNumber: formData.get('plateNumber'),
        year: formData.get('year'),
        mileage: formData.get('mileage'),
        status: formData.get('status'),
        lastServiceDate: formData.get('lastServiceDate')
      };

      const result = fleetService.addVehicle(payload);

      if (!result.success) {
        fleetRenderer.renderFormErrors(addVehicleForm, result.errors);
        return;
      }

      fleetRenderer.renderFormErrors(addVehicleForm, {});
      addVehicleForm.reset();
      refreshVehiclesUI();
      fleetRenderer.showToast('Статус автомобиля обновлён', 'success');
    });
  }

  if (fleetTableBody) {
    fleetTableBody.addEventListener('change', (event) => {
      const select = event.target.closest('select[data-action="status"]');
      if (!select) return;

      const { id } = select.dataset;
      fleetService.changeVehicleStatus(id, select.value);
      refreshVehiclesUI();
      fleetRenderer.showToast('Статус автомобиля обновлён', 'success');
    });

    fleetTableBody.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('button[data-action="delete"]');
      if (deleteBtn) {
        const { id } = deleteBtn.dataset;
        const confirmed = window.confirm('Удалить выбранное транспортное средство из реестра?');
        if (!confirmed) return;

        fleetService.deleteVehicle(id);
        refreshVehiclesUI();
        fleetRenderer.showToast('Транспортное средство удалено', 'info');
        return;
      }

      const editBtn = event.target.closest('button[data-action="edit"]');
      if (editBtn) {
        const { id } = editBtn.dataset;
        const vehicle = fleetService.getVehicleById(id);
        if (vehicle && editVehicleModal) {
          fleetRenderer.populateEditModal(vehicle);
          editVehicleModal.classList.add('visible');
        }
      }
    });
  }

  if (editVehicleForm) {
    editVehicleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(editVehicleForm);
      const id = formData.get('id');
      const payload = {
        brandModel: formData.get('brandModel'),
        plateNumber: formData.get('plateNumber'),
        year: formData.get('year'),
        mileage: formData.get('mileage'),
        status: formData.get('status'),
        lastServiceDate: formData.get('lastServiceDate')
      };

      const result = fleetService.updateVehicle(id, payload);
      if (!result.success) {
        fleetRenderer.renderFormErrors(editVehicleForm, result.errors);
        return;
      }

      fleetRenderer.renderFormErrors(editVehicleForm, {});
      editVehicleModal.classList.remove('visible');
      refreshVehiclesUI();
      fleetRenderer.showToast('Данные транспортного средства успешно обновлены', 'success');
    });
  }

  const driversTableBody = document.getElementById('driversTableBody');
  if (driversTableBody) {
    driversTableBody.addEventListener('change', (event) => {
      const select = event.target.closest('select[data-action="driver-status"]');
      if (!select) return;

      const { id } = select.dataset;
      fleetService.changeDriverStatus(id, select.value);
      fleetRenderer.showToast(`Статус водителя изменён на «${select.value}»`, 'success');
    });
  }

  if (btnOpenDriverModal && addDriverModal) {
    btnOpenDriverModal.addEventListener('click', () => {
      populateDriverVehicleDropdown();
      fleetRenderer.renderFormErrors(addDriverForm, {});
      addDriverModal.classList.add('visible');
    });
  }

  if (addDriverForm) {
    addDriverForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(addDriverForm);
      const payload = {
        fullName: formData.get('fullName'),
        licenseNumber: formData.get('licenseNumber'),
        categories: formData.get('categories'),
        experienceYears: formData.get('experienceYears'),
        assignedVehicle: formData.get('assignedVehicle'),
        status: formData.get('status')
      };

      const result = fleetService.addDriver(payload);
      if (!result.success) {
        fleetRenderer.renderFormErrors(addDriverForm, result.errors);
        return;
      }

      fleetRenderer.renderFormErrors(addDriverForm, {});
      addDriverForm.reset();
      addDriverModal.classList.remove('visible');
      refreshDriversUI();
      refreshSidebarCounters();
      fleetRenderer.showToast('Новый водитель успешно добавлен в реестр', 'success');
    });
  }

  const waybillsTableBody = document.getElementById('waybillsTableBody');
  if (waybillsTableBody) {
    waybillsTableBody.addEventListener('click', (event) => {
      const closeBtn = event.target.closest('button[data-action="close-waybill"]');
      if (!closeBtn) return;
      fleetService.closeWaybill(closeBtn.dataset.id);
      refreshWaybillsUI();
      fleetRenderer.showToast('Путевой лист закрыт', 'success');
    });
  }

  function openWaybillModal() {
    if (!addWaybillModal) return;
    populateWaybillDropdowns();
    addWaybillModal.classList.add('visible');
  }

  if (btnOpenWaybillModal) {
    btnOpenWaybillModal.addEventListener('click', openWaybillModal);
  }

  if (btnHeaderQuickWaybill) {
    btnHeaderQuickWaybill.addEventListener('click', () => {
      if (activeTab !== 'waybills') switchTab('waybills');
      openWaybillModal();
    });
  }

  if (addWaybillForm) {
    addWaybillForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(addWaybillForm);
      const payload = {
        driverName: formData.get('driverName'),
        vehiclePlate: formData.get('vehiclePlate'),
        route: formData.get('route'),
        shiftMileage: formData.get('shiftMileage')
      };

      const result = fleetService.createWaybill(payload);
      if (!result.success) {
        fleetRenderer.renderFormErrors(addWaybillForm, result.errors);
        return;
      }

      fleetRenderer.renderFormErrors(addWaybillForm, {});
      addWaybillForm.reset();
      addWaybillModal.classList.remove('visible');
      refreshWaybillsUI();
      fleetRenderer.showToast('Путевой лист успешно оформлен и сохранён в базе', 'success');
    });
  }

  function closeAllModals() {
    if (editVehicleModal) editVehicleModal.classList.remove('visible');
    if (addWaybillModal) addWaybillModal.classList.remove('visible');
    if (addDriverModal) addDriverModal.classList.remove('visible');
  }

  document.querySelectorAll('[data-dismiss="modal"]').forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  [editVehicleModal, addWaybillModal, addDriverModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeAllModals();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllModals();
  });

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const data = fleetService.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autopark_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      fleetRenderer.showToast('Резервная копия базы данных успешно экспортирована', 'info');
    });
  }

  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      const confirmed = window.confirm('Сбросить данные всех разделов системы к исходному состоянию?');
      if (!confirmed) return;

      fleetService.resetAllData();
      refreshActiveTab();
      fleetRenderer.showToast('База данных успешно возвращена к заводским настройкам', 'info');
    });
  }

  refreshVehiclesUI();
  refreshSidebarCounters();
})(window.AutoPark = window.AutoPark || {});
