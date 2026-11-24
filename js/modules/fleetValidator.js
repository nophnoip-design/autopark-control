(function (App) {
  function validateVehicle(data, isEditMode = false) {
    const errors = {};

    const brandModel = (data.brandModel || '').trim();
    const plateNumber = (data.plateNumber || '').trim();
    const yearNum = Number(data.year);
    const mileageNum = Number(data.mileage);
    const lastServiceDate = data.lastServiceDate;

    if (!brandModel || brandModel.length < 2) {
      errors.brandModel = 'Укажите марку и модель (минимум 2 символа)';
    }

    if (!plateNumber || plateNumber.length < 4) {
      errors.plateNumber = 'Введите корректный госномер (например, А142ВС 102)';
    }

    if (!data.year || !Number.isInteger(yearNum) || yearNum < 1990 || yearNum > 2027) {
      errors.year = 'Укажите корректный год выпуска (1990–2027)';
    }

    if (data.mileage === '' || Number.isNaN(mileageNum) || mileageNum < 0) {
      errors.mileage = 'Пробег не может быть отрицательным';
    }

    if (!lastServiceDate) {
      errors.lastServiceDate = 'Выберите дату последнего ТО';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  function validateWaybill(data) {
    const errors = {};
    if (!data.driverName) errors.driverName = 'Выберите водителя';
    if (!data.vehiclePlate) errors.vehiclePlate = 'Выберите автомобиль';
    if (!data.route || data.route.trim().length < 3) errors.route = 'Укажите маршрут рейса';
    const shiftKm = Number(data.shiftMileage);
    if (!data.shiftMileage || Number.isNaN(shiftKm) || shiftKm <= 0) {
      errors.shiftMileage = 'Укажите пробег рейса (больше 0)';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  function validateDriver(data) {
    const errors = {};
    const fullName = (data.fullName || '').trim();
    const licenseNumber = (data.licenseNumber || '').trim();
    const categories = (data.categories || '').trim();
    const expNum = Number(data.experienceYears);

    if (!fullName || fullName.length < 5) {
      errors.fullName = 'Укажите ФИО водителя полностью';
    }
    if (!licenseNumber || licenseNumber.length < 6) {
      errors.licenseNumber = 'Укажите номер ВУ (например, 02 24 418920)';
    }
    if (!categories) {
      errors.categories = 'Укажите открытые категории (например, B, C)';
    }
    if (data.experienceYears === '' || Number.isNaN(expNum) || !Number.isInteger(expNum) || expNum < 0 || expNum > 60) {
      errors.experienceYears = 'Укажите корректный стаж (0–60 лет)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  App.validateVehicle = validateVehicle;
  App.validateWaybill = validateWaybill;
  App.validateDriver = validateDriver;
})(window.AutoPark = window.AutoPark || {});
