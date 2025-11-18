import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const STREET = process.env.STREET;
const HOUSE = process.env.HOUSE;

const PHOTO_WHITE_BORDER_SIZE = 20;
const TYPE_DELAY = 120;

const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';

const UPDATE_DATE_SPLITER = '<span class="_update_info">Дата оновлення інформації</span> – ';

const HIDE_INFO_TEXT = `Якщо в даний момент у вас відсутнє світло, імовірно виникла аварійна ситуація, або діють стабілізаційні або екстрені відключення. Просимо перевірити інформацію через 15 хвилин, саме стільки часу потрібно для оновлення даних на сайті.`

export {
    TELEGRAM_BOT_TOKEN,
    CHAT_ID, 
    STREET,
    HOUSE,
    PHOTO_WHITE_BORDER_SIZE,
    TYPE_DELAY,
    DETEK_LINK,
    UPDATE_DATE_SPLITER,
    HIDE_INFO_TEXT,
};
