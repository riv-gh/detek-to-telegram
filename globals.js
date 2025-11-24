import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const DEFAULT_CITY = 'м. Київ';
const CITY = process.env.CITY || DEFAULT_CITY;
const STREET = process.env.STREET;
const HOUSE = process.env.HOUSE;
const APPEND_WEEK_DAYS = (process.env.APPEND_WEEK_DAYS === 'true');

const PHOTO_WHITE_BORDER_SIZE = 20;
const TYPE_DELAY = 120;

const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';
const DETEK_KREM_LINK = 'https://www.dtek-krem.com.ua/ua/shutdowns';

const UPDATE_DATE_SPLITER = 'Дата оновлення інформації – ';

const HIDE_INFO_TEXT_ARRAY = [
    `У разі відсутності світла у зоні, що гарантує його наявність (на графіку – білий колір), оформіть заявку нижче.\n`,
    `Просимо перевірити інформацію через 15 хвилин, саме стільки часу потрібно для оновлення даних на сайті.`,
];

const SHUTDONW_TEXT = `За вашою адресою в даний момент відсутня електроенергія`

const PREFIX_EMOJI = {
    NOT_SHUTDOWN: '✅ ',
    SHUTDOWN: '❌ ',
    LIGHTNING: '⚡ ',
}


export {
    TELEGRAM_BOT_TOKEN,
    CHAT_ID, 
    DEFAULT_CITY,
    CITY,
    STREET,
    HOUSE,
    APPEND_WEEK_DAYS,
    PHOTO_WHITE_BORDER_SIZE,
    TYPE_DELAY,
    DETEK_LINK,
    DETEK_KREM_LINK,
    UPDATE_DATE_SPLITER,
    HIDE_INFO_TEXT_ARRAY,
    SHUTDONW_TEXT,
    PREFIX_EMOJI,
};
