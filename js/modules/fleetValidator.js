(function (App) {
  function checkUnsafe(value, fieldLabel) {
    if (App.fleetSecurity && App.fleetSecurity.hasUnsafePattern(value)) {
      App.fleetSecurity.logEvent('XSS_BLOCKED', `Заблокирован потенциально опасный ввод в поле «${fieldLabel}»`);
      return 'Обнаружены недопустимые символы или потенциально опасный код';
    }
    return null;
  }

  function validateVehicle(data, isEditMode = false) {
    const errors = {};

    const brandModel = (data.brandModel || '').trim();
    const plateNumber = (data.plateNumber || '').trim();
    const yearNum = Number(data.year);
    const mileageNum = Number(data.mileage);
    const lastServiceDate = data.lastServiceDate;

    const unsafeBrand = checkUnsafe(brandModel, 'Марка и модель');
    const unsafePlate = checkUnsafe(plateNumber, 'Гос. номер');

    if (unsafeBrand) {
      errors.brandModel = unsafeBrand;
    } else if (!brandModel || brandModel.length < 2) {
      errors.brandModel = 'Укажите марку и модель (минимум 2 символа)';
    }

    if (unsafePlate) {
      errors.plateNumber = unsafePlate;
    } else if (!plateNumber || plateNumber.length < 4) {
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
    const unsafeRoute = checkUnsafe(data.route, 'Маршрут следования');
    if (unsafeRoute) {
      errors.route = unsafeRoute;
    } else if (!data.route || data.route.trim().length < 3) {
      errors.route = 'Укажите маршрут рейса';
    }
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

    const unsafeName = checkUnsafe(fullName, 'ФИО водителя');
    const unsafeLicense = checkUnsafe(licenseNumber, 'Номер ВУ');
    const unsafeCategories = checkUnsafe(categories, 'Категории ВУ');

    if (unsafeName) {
      errors.fullName = unsafeName;
    } else if (!fullName || fullName.length < 5) {
      errors.fullName = 'Укажите ФИО водителя полностью';
    }
    if (unsafeLicense) {
      errors.licenseNumber = unsafeLicense;
    } else if (!licenseNumber || licenseNumber.length < 6) {
      errors.licenseNumber = 'Укажите номер ВУ (например, 02 24 418920)';
    }
    if (unsafeCategories) {
      errors.categories = unsafeCategories;
    } else if (!categories) {
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
