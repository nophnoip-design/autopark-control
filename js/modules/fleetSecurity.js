(function (App) {
  const ROLE_STORAGE_KEY = 'autopark_role_v2';
  const LOG_STORAGE_KEY = 'autopark_security_log_v2';

  const ROLES = {
    dispatcher: {
      id: 'dispatcher',
      label: 'Диспетчер',
      user: 'Погорелов А.В.',
      initials: 'ПА',
      subtitle: 'Диспетчер · 2 ИСиП Б',
      pin: null,
      permissions: ['view', 'create', 'edit', 'status', 'export', 'security_log']
    },
    admin: {
      id: 'admin',
      label: 'Администратор',
      user: 'Сафин Р.М.',
      initials: 'СР',
      subtitle: 'Руководитель АТП · Полный доступ',
      pin: '1234',
      permissions: ['view', 'create', 'edit', 'status', 'delete', 'export', 'reset', 'security_log']
    },
    viewer: {
      id: 'viewer',
      label: 'Наблюдатель',
      user: 'Аудитор СБ',
      initials: 'АС',
      subtitle: 'Только чтение · Аудит',
      pin: null,
      permissions: ['view', 'security_log']
    }
  };

  const PERMISSION_LABELS = {
    view: 'Просмотр разделов и отчётов',
    create: 'Добавление ТС, водителей и ПЛ',
    edit: 'Редактирование карточек ТС',
    status: 'Изменение статусов и закрытие ПЛ',
    delete: 'Удаление записей из реестра',
    export: 'Экспорт резервной копии JSON',
    reset: 'Полный сброс базы данных'
  };

  const UNSAFE_PATTERNS = [
    /<\s*script\b/i,
    /<\s*\/\s*script\s*>/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /<\s*iframe\b/i,
    /<\s*svg\b/i,
    /\b(DROP\s+TABLE|UNION\s+SELECT|DELETE\s+FROM)\b/i
  ];

  function nowFormatted() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function loadLog() {
    try {
      const raw = localStorage.getItem(LOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore storage errors
    }
    return [
      {
        time: nowFormatted(),
        type: 'POLICY_INIT',
        role: 'Диспетчер',
        message: 'Инициализирована политика разграничения доступа (RBAC) и фильтрация ввода'
      }
    ];
  }

  function saveLog(entries) {
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries.slice(0, 40)));
    } catch (e) {
      // ignore storage errors
    }
  }

  function getCurrentRoleId() {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    return saved && ROLES[saved] ? saved : 'dispatcher';
  }

  App.fleetSecurity = {
    ROLES,
    PERMISSION_LABELS,

    getCurrentRole() {
      return ROLES[getCurrentRoleId()];
    },

    getAuditLog() {
      return loadLog();
    },

    logEvent(type, message) {
      const role = this.getCurrentRole().label;
      const entries = loadLog();
      entries.unshift({
        time: nowFormatted(),
        type,
        role,
        message
      });
      saveLog(entries);
    },

    switchRole(roleId, pinCode = '') {
      const target = ROLES[roleId];
      if (!target) {
        return { success: false, message: 'Неизвестная роль пользователя' };
      }

      if (target.pin && String(pinCode).trim() !== target.pin) {
        this.logEvent('FAILED_AUTH', `Неудачная попытка входа в роль «${target.label}» (неверный PIN)`);
        return { success: false, message: 'Неверный PIN-код администратора (подсказка: 1234)' };
      }

      localStorage.setItem(ROLE_STORAGE_KEY, roleId);
      this.logEvent('ROLE_SWITCH', `Активная роль изменена на «${target.label}» (${target.user})`);
      return { success: true, role: target };
    },

    can(permission) {
      const role = this.getCurrentRole();
      return role.permissions.includes(permission);
    },

    requirePermission(permission, actionTitle) {
      if (this.can(permission)) {
        return { allowed: true };
      }
      const role = this.getCurrentRole();
      const msg = `Доступ запрещён для роли «${role.label}»: ${actionTitle}`;
      this.logEvent('ACCESS_DENIED', msg);
      return { allowed: false, message: msg };
    },

    hasUnsafePattern(value) {
      if (value === null || value === undefined) return false;
      const text = String(value);
      return UNSAFE_PATTERNS.some((re) => re.test(text));
    },

    sanitizeText(value) {
      return String(value || '')
        .replace(/[<>]/g, '')
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .trim();
    }
  };
})(window.AutoPark = window.AutoPark || {});
