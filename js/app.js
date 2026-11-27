(function (App) {
  const { fleetService, fleetRenderer, fleetSecurity } = App;

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
  const securityModal = document.getElementById('securityModal');

  const btnExportJson = document.getElementById('btnExportJson');
  const btnResetData = document.getElementById('btnResetData');
  const btnOpenWaybillModal = document.getElementById('btnOpenWaybillModal');
  const btnOpenDriverModal = document.getElementById('btnOpenDriverModal');
  const btnHeaderQuickWaybill = document.getElementById('btnHeaderQuickWaybill');
  const btnOpenSecurityModal = document.getElementById('btnOpenSecurityModal');

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
        if (result.message) {
          fleetRenderer.showToast(result.message, 'error');
        }
        fleetRenderer.renderFormErrors(addVehicleForm, result.errors || {});
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
      const result = fleetService.changeVehicleStatus(id, select.value);
      if (!result.success) {
        refreshVehiclesUI();
        fleetRenderer.showToast(result.message, 'error');
        return;
      }
      refreshVehiclesUI();
      fleetRenderer.showToast('Статус автомобиля обновлён', 'success');
    });

    fleetTableBody.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('button[data-action="delete"]');
      if (deleteBtn) {
        if (fleetSecurity && !fleetSecurity.can('delete')) {
          const denied = fleetService.deleteVehicle(deleteBtn.dataset.id);
          fleetRenderer.showToast(denied.message, 'error');
          return;
        }
        const { id } = deleteBtn.dataset;
        const confirmed = window.confirm('Удалить выбранное транспортное средство из реестра?');
        if (!confirmed) return;

        const result = fleetService.deleteVehicle(id);
        if (!result.success) {
          fleetRenderer.showToast(result.message, 'error');
          return;
        }
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
        if (result.message) {
          fleetRenderer.showToast(result.message, 'error');
        }
        fleetRenderer.renderFormErrors(editVehicleForm, result.errors || {});
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
      const result = fleetService.changeDriverStatus(id, select.value);
      if (!result.success) {
        refreshDriversUI();
        fleetRenderer.showToast(result.message, 'error');
        return;
      }
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
        if (result.message) {
          fleetRenderer.showToast(result.message, 'error');
        }
        fleetRenderer.renderFormErrors(addDriverForm, result.errors || {});
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
      const result = fleetService.closeWaybill(closeBtn.dataset.id);
      if (!result.success) {
        fleetRenderer.showToast(result.message, 'error');
        return;
      }
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
        if (result.message) {
          fleetRenderer.showToast(result.message, 'error');
        }
        fleetRenderer.renderFormErrors(addWaybillForm, result.errors || {});
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
    if (securityModal) securityModal.classList.remove('visible');
  }

  document.querySelectorAll('[data-dismiss="modal"]').forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  [editVehicleModal, addWaybillModal, addDriverModal, securityModal].forEach((modal) => {
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
      const result = fleetService.exportData();
      if (!result.success) {
        fleetRenderer.showToast(result.message, 'error');
        return;
      }
      const jsonStr = JSON.stringify(result.data, null, 2);
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
      if (fleetSecurity && !fleetSecurity.can('reset')) {
        const denied = fleetService.resetAllData();
        fleetRenderer.showToast(denied.message, 'error');
        return;
      }
      const confirmed = window.confirm('Сбросить данные всех разделов системы к исходному состоянию?');
      if (!confirmed) return;

      const result = fleetService.resetAllData();
      if (!result.success) {
        fleetRenderer.showToast(result.message, 'error');
        return;
      }
      refreshActiveTab();
      fleetRenderer.showToast('База данных успешно возвращена к заводским настройкам', 'info');
    });
  }

  function renderSecurityUI() {
    if (!fleetSecurity) return;
    const role = fleetSecurity.getCurrentRole();

    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const roleLabelEl = document.getElementById('userRoleLabel');
    const roleBadgeEl = document.getElementById('sidebarRoleBadge');

    if (avatarEl) avatarEl.textContent = role.initials;
    if (nameEl) nameEl.textContent = role.user;
    if (roleLabelEl) roleLabelEl.textContent = role.subtitle;
    if (roleBadgeEl) roleBadgeEl.textContent = role.label;

    document.querySelectorAll('.role-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.role === role.id);
    });

    const permList = document.getElementById('securityPermList');
    if (permList) {
      permList.innerHTML = Object.entries(fleetSecurity.PERMISSION_LABELS)
        .map(([permKey, label]) => {
          const ok = fleetSecurity.can(permKey);
          return `
            <div class="perm-item">
              <span>${label}</span>
              <span class="${ok ? 'perm-status-ok' : 'perm-status-no'}">${ok ? 'Разрешено' : 'Запрещено'}</span>
            </div>
          `;
        })
        .join('');
    }

    const logList = document.getElementById('securityLogList');
    if (logList) {
      const entries = fleetSecurity.getAuditLog();
      const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
      ));
      logList.innerHTML = entries
        .map((entry) => {
          const isWarn = ['ACCESS_DENIED', 'FAILED_AUTH', 'XSS_BLOCKED', 'INTEGRITY_GUARD'].includes(entry.type);
          return `
            <div class="sec-log-row">
              <span class="mono">${esc(entry.time)}</span>
              <span class="sec-log-type mono ${isWarn ? 'is-warn' : ''}">${esc(entry.type)}</span>
              <span>${esc(entry.message)}</span>
            </div>
          `;
        })
        .join('');
    }
  }

  if (btnOpenSecurityModal && securityModal) {
    btnOpenSecurityModal.addEventListener('click', () => {
      const pinRow = document.getElementById('adminPinRow');
      const pinErr = document.getElementById('adminPinError');
      if (pinRow) pinRow.style.display = 'none';
      if (pinErr) pinErr.textContent = '';
      renderSecurityUI();
      securityModal.classList.add('visible');
    });
  }

  const roleCardsGrid = document.getElementById('roleCardsGrid');
  if (roleCardsGrid && fleetSecurity) {
    roleCardsGrid.addEventListener('click', (event) => {
      const card = event.target.closest('.role-card');
      if (!card) return;
      const targetRole = card.dataset.role;
      const pinRow = document.getElementById('adminPinRow');
      const pinInput = document.getElementById('adminPinInput');
      const pinErr = document.getElementById('adminPinError');

      if (targetRole === 'admin' && fleetSecurity.getCurrentRole().id !== 'admin') {
        if (pinRow) pinRow.style.display = 'block';
        if (pinErr) pinErr.textContent = '';
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
        return;
      }

      const currentRole = fleetSecurity.getCurrentRole();
      if (targetRole === currentRole.id) {
        fleetRenderer.showToast(`Роль «${currentRole.label}» уже активна`, 'info');
        return;
      }

      if (pinRow) pinRow.style.display = 'none';
      const res = fleetSecurity.switchRole(targetRole);
      if (res.success) {
        renderSecurityUI();
        fleetRenderer.showToast(`Активная роль: ${res.role.label}`, 'success');
      }
    });
  }

  const btnConfirmAdminRole = document.getElementById('btnConfirmAdminRole');
  const adminPinInput = document.getElementById('adminPinInput');
  if (adminPinInput && btnConfirmAdminRole) {
    adminPinInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        btnConfirmAdminRole.click();
      }
    });
  }
  if (btnConfirmAdminRole && fleetSecurity) {
    btnConfirmAdminRole.addEventListener('click', () => {
      const pinInput = document.getElementById('adminPinInput');
      const pinErr = document.getElementById('adminPinError');
      const pinRow = document.getElementById('adminPinRow');
      const res = fleetSecurity.switchRole('admin', pinInput ? pinInput.value : '');
      if (!res.success) {
        if (pinErr) pinErr.textContent = res.message;
        renderSecurityUI();
        return;
      }
      if (pinRow) pinRow.style.display = 'none';
      renderSecurityUI();
      fleetRenderer.showToast(`Выполнен вход с правами: ${res.role.label}`, 'success');
    });
  }

  renderSecurityUI();
  refreshVehiclesUI();
  refreshSidebarCounters();
})(window.AutoPark = window.AutoPark || {});
