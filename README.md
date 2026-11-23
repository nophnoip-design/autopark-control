# АвтоПарк-Контроль

Информационная система учёта и управления эксплуатацией автотранспорта предприятия (УП.05, ПМ.05 «Проектирование и разработка информационных систем»).

## Структура проекта

- `index.html` — точка входа (App Shell с фиксированной боковой панелью и 5 разделами)
- `css/fleet.css` — дизайн-система (хвойный `#1B4D3E`, обсидиан `#181A18`, алебастр `#F3F1EC`, терракота `#C2410C`, WCAG 2.1 AAA/AA)
- `js/data/fleetStore.js` — слой хранения данных (`LocalStorage API` + начальные эталонные данные)
- `js/modules/fleetValidator.js` — клиентская валидация форм (ТС, водители, путевые листы)
- `js/modules/fleetService.js` — бизнес-логика, расчёт расхода ГСМ и аналитические KPI
- `js/ui/fleetRenderer.js` — рендеринг таблиц, карточек KPI, госномеров РФ и уведомлений (Toast)
- `js/app.js` — маршрутизация SPA, модальные окна, экспорт JSON и сброс данных
- `database/autopark_control.sql` — SQL-дамп базы данных для импорта в **phpMyAdmin** (MySQL / MariaDB)

## База данных (phpMyAdmin)

Файл `database/autopark_control.sql` содержит SQL-скрипт создания базы данных `autopark_control` (`utf8mb4_unicode_ci`) со связанными таблицами `vehicles`, `drivers`, `waybills` и `maintenance_records` и эталонными записями. Для развёртывания откройте phpMyAdmin → вкладка **Импорт** → выберите `database/autopark_control.sql`.

## Запуск

Откройте `index.html` в браузере или запустите локальный веб-сервер:

```bash
python -m http.server 8080
```
