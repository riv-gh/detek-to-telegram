# detek-to-telegram

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Repo stars](https://img.shields.io/github/stars/riv-gh/detek-to-telegram?style=social)](https://github.com/riv-gh/detek-to-telegram)

## 🌐 Языки
- [English](README.md)
- [Русский](README.ru.md)
- [Українська](README.uk.md)

![Скриншот работы бота](./docs/screenshot.png)

Небольшой сервис, пересылающий уведомления (графики и сообщения) о отключении электроэнерии в Telegram.

## Особенности
- Пересылка текстовых уведомлений в указанный Telegram-чат.
- Простая конфигурация через переменные окружения.

## Быстрый старт

1. Создать Telegram-бота через BotFather и получить токен.
2. Узнать chat_id (отправив сообщение боту и проверив лог).
3. Скачать репозиторий по [Ссылке](https://github.com/riv-gh/detek-to-telegram/archive/refs/heads/master.zip) или клониуйте его `git clone https://github.com/riv-gh/detek-to-telegram.git`
4. Перейти в папку `cd detek-to-telegram` и выполнить `npm install`
3. Установить переменные окружения (.env) и запустить приложение при помощи `npm start`

## Переменные окружения .env
- TELEGRAM_BOT_TOKEN - токен бота
- CHAT_ID -  токен бота
- CHAT_ID_GROUP - id чата или канала
- CITY - город (в случае Киева можно не указывать)
- STREET - название улицы
- HOUSE - номер дома

Пример .env файла (файл має мати назву `.env`):
```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF..
CHAT_ID=-1001234567890
CITY=м. Київ
STREET=вул. Арсенальна
HOUSE=15
```

Пример (Linux/macOS):
```bash
export TELEGRAM_TOKEN=123456:ABC-DEF...
export TELEGRAM_CHAT_ID=-1001234567890
...
npm start
```

Пример Windows (PowerShell):
```powershell
$env:TELEGRAM_TOKEN = "123456:ABC-DEF..."
$env:TELEGRAM_CHAT_ID = "-1001234567890"
...
npm start
```