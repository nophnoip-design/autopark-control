-- ============================================================================
-- Информационная система «АвтоПарк-Контроль»
-- Схема базы данных и начальные данные для импорта в phpMyAdmin (MySQL / MariaDB)
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:00";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `autopark_control`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `autopark_control`;

-- ----------------------------------------------------------------------------
-- 1. Таблица транспортных средств (vehicles)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `maintenance_records`;
DROP TABLE IF EXISTS `waybills`;
DROP TABLE IF EXISTS `drivers`;
DROP TABLE IF EXISTS `vehicles`;

CREATE TABLE `vehicles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `brand_model` VARCHAR(120) NOT NULL COMMENT 'Марка и модель ТС',
  `plate_number` VARCHAR(20) NOT NULL COMMENT 'Государственный регистрационный номер',
  `manufacture_year` SMALLINT UNSIGNED NOT NULL COMMENT 'Год выпуска',
  `mileage` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Текущий пробег (км)',
  `status` ENUM('Свободен', 'В рейсе', 'На ТО') NOT NULL DEFAULT 'Свободен',
  `last_service_date` DATE NOT NULL COMMENT 'Дата последнего ТО',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vehicles_plate` (`plate_number`),
  KEY `idx_vehicles_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Реестр транспортных средств автопарка';

-- ----------------------------------------------------------------------------
-- 2. Таблица водительского состава (drivers)
-- ----------------------------------------------------------------------------
CREATE TABLE `drivers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(150) NOT NULL COMMENT 'ФИО водителя',
  `license_number` VARCHAR(32) NOT NULL COMMENT 'Серия и номер ВУ',
  `categories` VARCHAR(40) NOT NULL COMMENT 'Открытые категории ВУ',
  `experience_years` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Стаж вождения (лет)',
  `vehicle_id` INT UNSIGNED NULL COMMENT 'Закреплённое ТС',
  `status` ENUM('Свободен', 'На линии', 'В отпуске') NOT NULL DEFAULT 'Свободен',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_drivers_license` (`license_number`),
  KEY `idx_drivers_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_drivers_vehicle`
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Справочник водителей предприятия';

-- ----------------------------------------------------------------------------
-- 3. Таблица путевых листов (waybills)
-- ----------------------------------------------------------------------------
CREATE TABLE `waybills` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `waybill_number` VARCHAR(20) NOT NULL COMMENT 'Номер путевого листа',
  `issue_date` DATE NOT NULL COMMENT 'Дата оформления',
  `driver_id` INT UNSIGNED NOT NULL,
  `vehicle_id` INT UNSIGNED NOT NULL,
  `route` VARCHAR(255) NOT NULL COMMENT 'Маршрут следования',
  `shift_mileage` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Пробег за смену (км)',
  `fuel_used` DECIMAL(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Расход ГСМ (л)',
  `status` ENUM('Открыт', 'Закрыт') NOT NULL DEFAULT 'Открыт',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_waybills_number` (`waybill_number`),
  KEY `idx_waybills_driver` (`driver_id`),
  KEY `idx_waybills_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_waybills_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_waybills_vehicle`
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Журнал регистрации путевых листов';

-- ----------------------------------------------------------------------------
-- 4. Таблица технического обслуживания и ремонтов (maintenance_records)
-- ----------------------------------------------------------------------------
CREATE TABLE `maintenance_records` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` INT UNSIGNED NOT NULL,
  `service_type` VARCHAR(255) NOT NULL COMMENT 'Вид работ ТО или ремонта',
  `service_date` DATE NOT NULL COMMENT 'Дата проведения работ',
  `contractor` VARCHAR(160) NOT NULL COMMENT 'Исполнитель (СТО)',
  `cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Стоимость работ (руб.)',
  `status` ENUM('В ремонте', 'Завершено') NOT NULL DEFAULT 'В ремонте',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_maintenance_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_maintenance_vehicle`
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Журнал технического обслуживания и ремонтов';

-- ----------------------------------------------------------------------------
-- Наполнение таблиц эталонными данными
-- ----------------------------------------------------------------------------
INSERT INTO `vehicles` (`id`, `brand_model`, `plate_number`, `manufacture_year`, `mileage`, `status`, `last_service_date`) VALUES
  (1, 'ГАЗель Next', 'А142ВС 102', 2022, 68400, 'В рейсе', '2026-10-12'),
  (2, 'КАМАЗ 5490', 'Е508КМ 102', 2021, 194200, 'В рейсе', '2026-09-25'),
  (3, 'Hyundai Solaris', 'М771ОР 102', 2023, 41350, 'Свободен', '2026-11-04'),
  (4, 'Lada Largus', 'К319ТА 102', 2020, 112800, 'На ТО', '2026-11-18'),
  (5, 'Ford Transit', 'О890УН 102', 2021, 135600, 'Свободен', '2026-10-29'),
  (6, 'Volkswagen Polo', 'Х205ЕЕ 102', 2022, 57900, 'Свободен', '2026-10-03');

INSERT INTO `drivers` (`id`, `full_name`, `license_number`, `categories`, `experience_years`, `vehicle_id`, `status`) VALUES
  (1, 'Иванов Сергей Петрович', '02 14 582910', 'B, C, D', 14, 2, 'На линии'),
  (2, 'Смирнов Алексей Дмитриевич', '02 08 391204', 'B, C', 9, 1, 'На линии'),
  (3, 'Кузнецов Михаил Андреевич', '02 19 847291', 'B', 6, 3, 'Свободен'),
  (4, 'Васильев Руслан Ильдарович', '02 22 109283', 'B, C, E', 18, 5, 'Свободен'),
  (5, 'Гарипов Азат Радикович', '02 11 639201', 'B', 4, 4, 'В отпуске');

INSERT INTO `waybills` (`id`, `waybill_number`, `issue_date`, `driver_id`, `vehicle_id`, `route`, `shift_mileage`, `fuel_used`, `status`) VALUES
  (1, 'ПЛ-00101', '2026-11-24', 1, 2, 'Уфа – Стерлитамак – Уфа', 260, 78.00, 'Закрыт'),
  (2, 'ПЛ-00102', '2026-11-24', 2, 1, 'Уфа (городская логистика)', 145, 18.80, 'Открыт'),
  (3, 'ПЛ-00103', '2026-11-23', 4, 5, 'Уфа – Благовещенск', 95, 11.40, 'Закрыт');

INSERT INTO `maintenance_records` (`id`, `vehicle_id`, `service_type`, `service_date`, `contractor`, `cost`, `status`) VALUES
  (1, 4, 'Плановое ТО-2, замена масла и ГРМ', '2026-11-18', 'ООО «АвтоТехЦентр Уфа»', 18500.00, 'В ремонте'),
  (2, 3, 'Замена тормозных колодок и дисков', '2026-11-04', 'Сервисный центр «Транзит»', 12400.00, 'Завершено'),
  (3, 2, 'Диагностика пневмосистемы и замена фильтров', '2026-09-25', 'ООО «КАМАЗ Центр Уфа»', 34200.00, 'Завершено');
