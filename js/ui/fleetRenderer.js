(function (App) {
  const STATUS_OPTIONS = ['Свободен', 'В рейсе', 'На ТО'];
  const DRIVER_STATUS_OPTIONS = ['Свободен', 'На линии', 'В отпуске'];

  const numberFormatter = new Intl.NumberFormat('ru-RU');
  let toastTimer = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getStatusClass(status) {
    if (status === 'Свободен') return 'status-available';
    if (status === 'В рейсе' || status === 'На линии') return 'status-route';
    if (status === 'В отпуске') return 'status-vacation';
    return 'status-service';
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return escapeHtml(dateString);
    return `${day}.${month}.${year}`;
  }

  function renderPlateBadge(plateText) {
    const clean = String(plateText || '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      const reg = parts[parts.length - 1];
      const num = parts.slice(0, -1).join(' ');
      return `
        <span class="license-plate">
          <span class="plate-num">${escapeHtml(num)}</span>
          <span class="plate-divider"></span>
          <span class="plate-region">${escapeHtml(reg)}</span>
        </span>
      `;
    }
    return `<span class="license-plate">${escapeHtml(clean)}</span>`;
  }

  App.fleetRenderer = {
    renderStats(stats) {
      document.getElementById('statTotal').textContent = stats.total;
      document.getElementById('statAvailable').textContent = stats.available;
      document.getElementById('statInRoute').textContent = stats.inRoute;
      document.getElementById('statInService').textContent = stats.inService;
      document.getElementById('statMileage').textContent = `${numberFormatter.format(stats.totalMileage)} км`;

      const navVehiclesCount = document.getElementById('navVehiclesCount');
      if (navVehiclesCount) navVehiclesCount.textContent = stats.total;

      const navMaintBadge = document.getElementById('navMaintBadge');
      if (navMaintBadge) navMaintBadge.textContent = stats.inService;

      const readyCount = Math.max(0, stats.total - stats.inService);
      const shiftText = document.getElementById('sidebarShiftText');
      const shiftBar = document.getElementById('sidebarShiftBar');
      if (shiftText) {
        shiftText.textContent = `Готовность: ${readyCount} / ${stats.total} ТС (${stats.readiness}%)`;
      }
      if (shiftBar) {
        shiftBar.style.width = `${stats.readiness}%`;
      }
    },

    renderTable(vehicles) {
      const tbody = document.getElementById('fleetTableBody');

      if (!vehicles.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="empty-cell">
              Транспортные средства по заданным параметрам не найдены
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = vehicles
        .map((vehicle) => {
          const optionsMarkup = STATUS_OPTIONS.map(
            (status) =>
              `<option value="${status}" ${vehicle.status === status ? 'selected' : ''}>${status}</option>`
          ).join('');

          return `
            <tr>
              <td><strong>${escapeHtml(vehicle.brandModel)}</strong></td>
              <td>${renderPlateBadge(vehicle.plateNumber)}</td>
              <td class="mono">${vehicle.year}</td>
              <td class="mono">${numberFormatter.format(vehicle.mileage)} км</td>
              <td class="mono">${formatDate(vehicle.lastServiceDate)}</td>
              <td>
                <select
                  class="status-select ${getStatusClass(vehicle.status)}"
                  data-action="status"
                  data-id="${vehicle.id}"
                  aria-label="Статус ${escapeHtml(vehicle.brandModel)}"
                >
                  ${optionsMarkup}
                </select>
              </td>
              <td class="table-actions">
                <button
                  type="button"
                  class="btn btn-sm btn-secondary"
                  data-action="edit"
                  data-id="${vehicle.id}"
                  title="Редактировать запись"
                >
                  Редактировать
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-danger-outline"
                  data-action="delete"
                  data-id="${vehicle.id}"
                  title="Удалить ТС"
                >
                  Удалить
                </button>
              </td>
            </tr>
          `;
        })
        .join('');
    },

    renderDrivers(drivers) {
      const tbody = document.getElementById('driversTableBody');
      if (!tbody) return;

      const navDriversCount = document.getElementById('navDriversCount');
      if (navDriversCount) navDriversCount.textContent = drivers.length;

      tbody.innerHTML = drivers
        .map((driver) => {
          const options = DRIVER_STATUS_OPTIONS.map(
            (st) => `<option value="${st}" ${driver.status === st ? 'selected' : ''}>${st}</option>`
          ).join('');

          return `
            <tr>
              <td><strong>${escapeHtml(driver.fullName)}</strong></td>
              <td class="mono">${escapeHtml(driver.licenseNumber)}</td>
              <td><span class="badge-category">${escapeHtml(driver.categories)}</span></td>
              <td class="mono">${driver.experienceYears} лет</td>
              <td>${escapeHtml(driver.assignedVehicle)}</td>
              <td>
                <select
                  class="status-select ${getStatusClass(driver.status)}"
                  data-action="driver-status"
                  data-id="${driver.id}"
                >
                  ${options}
                </select>
              </td>
            </tr>
          `;
        })
        .join('');
    },

    renderDriverStats(stats) {
      const elTotal = document.getElementById('driverStatTotal');
      const elOnLine = document.getElementById('driverStatOnLine');
      const elAvail = document.getElementById('driverStatAvailable');
      const elVac = document.getElementById('driverStatVacation');

      if (elTotal) elTotal.textContent = stats.total;
      if (elOnLine) elOnLine.textContent = stats.onLine;
      if (elAvail) elAvail.textContent = stats.available;
      if (elVac) elVac.textContent = stats.onVacation;
    },

    renderWaybills(waybills) {
      const tbody = document.getElementById('waybillsTableBody');
      if (!tbody) return;

      const navWaybillsCount = document.getElementById('navWaybillsCount');
      if (navWaybillsCount) navWaybillsCount.textContent = waybills.length;

      tbody.innerHTML = waybills
        .map((wb) => `
          <tr>
            <td class="mono"><strong>${escapeHtml(wb.number)}</strong></td>
            <td class="mono">${formatDate(wb.date)}</td>
            <td>${escapeHtml(wb.driverName)}</td>
            <td>${escapeHtml(wb.vehiclePlate)}</td>
            <td>${escapeHtml(wb.route)}</td>
            <td class="mono">${wb.shiftMileage} км</td>
            <td class="mono"><strong>${wb.fuelUsed} л</strong></td>
            <td>
              <span class="badge ${wb.status === 'Закрыт' ? 'badge-success' : 'badge-warning'}">
                ${wb.status}
              </span>
            </td>
            <td class="table-actions">
              ${wb.status === 'Открыт'
                ? `<button type="button" class="btn btn-sm btn-secondary" data-action="close-waybill" data-id="${wb.id}">Закрыть ПЛ</button>`
                : `<span class="kpi-note-text mono">Завершён</span>`
              }
            </td>
          </tr>
        `)
        .join('');
    },

    renderMaintenance(list) {
      const tbody = document.getElementById('maintenanceTableBody');
      if (!tbody) return;

      tbody.innerHTML = list
        .map((m) => `
          <tr>
            <td class="mono">${formatDate(m.serviceDate)}</td>
            <td><strong>${escapeHtml(m.vehiclePlate)}</strong></td>
            <td>${escapeHtml(m.serviceType)}</td>
            <td>${escapeHtml(m.contractor)}</td>
            <td class="mono"><strong>${numberFormatter.format(m.cost)} ₽</strong></td>
            <td>
              <span class="badge ${m.status === 'Завершено' ? 'badge-success' : 'badge-danger'}">
                ${m.status}
              </span>
            </td>
          </tr>
        `)
        .join('');
    },

    renderAnalytics(analytics, fleetStats) {
      const elWbKm = document.getElementById('anTotalWbKm');
      const elFuelLit = document.getElementById('anTotalFuel');
      const elFuelCost = document.getElementById('anFuelCost');
      const elMaintCost = document.getElementById('anMaintCost');
      const elTotalExp = document.getElementById('anTotalExpenses');
      const elReadiness = document.getElementById('anReadiness');

      if (elWbKm) elWbKm.textContent = `${numberFormatter.format(analytics.totalWaybillKm)} км`;
      if (elFuelLit) elFuelLit.textContent = `${numberFormatter.format(analytics.totalFuelLiters)} л`;
      if (elFuelCost) elFuelCost.textContent = `${numberFormatter.format(analytics.totalFuelCostRub)} ₽`;
      if (elMaintCost) elMaintCost.textContent = `${numberFormatter.format(analytics.totalMaintenanceCostRub)} ₽`;
      if (elTotalExp) elTotalExp.textContent = `${numberFormatter.format(analytics.totalOperationalExpenses)} ₽`;
      if (elReadiness) elReadiness.textContent = `${fleetStats.readiness}%`;
    },

    populateEditModal(vehicle) {
      const form = document.getElementById('editVehicleForm');
      if (!form) return;
      form.elements['id'].value = vehicle.id;
      form.elements['brandModel'].value = vehicle.brandModel;
      form.elements['plateNumber'].value = vehicle.plateNumber;
      form.elements['year'].value = vehicle.year;
      form.elements['mileage'].value = vehicle.mileage;
      form.elements['status'].value = vehicle.status;
      form.elements['lastServiceDate'].value = vehicle.lastServiceDate;
    },

    renderFormErrors(formElement, errors = {}) {
      const errorFields = formElement.querySelectorAll('[data-error]');
      errorFields.forEach((span) => {
        const fieldName = span.dataset.error;
        const input = formElement.elements[fieldName];
        const message = errors[fieldName] || '';

        span.textContent = message;
        if (input) {
          input.classList.toggle('input-invalid', Boolean(message));
        }
      });
    },

    showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.className = `toast visible toast-${type}`;

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
      }, 3000);
    }
  };
})(window.AutoPark = window.AutoPark || {});
