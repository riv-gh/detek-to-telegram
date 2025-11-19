const puppeteer = require('puppeteer');

const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';

let browser = null;

const browserParams = { headless: false, defaultViewport: null, args: ['--start-maximized'] };

browser = browser || await puppeteer.launch(browserParams);
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1024 });
await page.goto(DETEK_LINK);


/////////////////////////////////
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const STREET = process.env.STREET;
const HOUSE = process.env.HOUSE;

const PHOTO_WHITE_BORDER_SIZE = 20;
const TYPE_DELAY = 120;

// const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';

const UPDATE_DATE_SPLITER = '<span class="_update_info">Дата оновлення інформації</span> – ';

const HIDE_INFO_TEXT = `Просимо перевірити інформацію через 15 хвилин, саме стільки часу потрібно для оновлення даних на сайті.
У разі відсутності світла у зоні, що гарантує його наявність (на графіку – білий колір), оформіть заявку нижче.`


async function sendMessage(text, parse_mode = 'MarkdownV2') {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text',text);
    // formData.append('parse_mode', parse_mode);
    formData.append('parse_mode', 'MarkdownV2');
    // formData.append('parse_mode', 'HTML');
    
    console.log(text);
    // return {};
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, formData, {
        headers: formData.getHeaders(),
    });
}

var text =`За вашою адресою в даний момент відсутня електроенергія
Причина: Стабілізаційне відключення (Згідно графіку погодинних відключень)
Час початку – 13:00 19.11.2025
Орієнтовний час відновлення електроенергії – до 17:00 19.11.2025

Данні оновлено: 
12:50 19.11.2025
13:10 19.11.2025`;

var tmp = await sendMessage(text.replace(/[\.|\:]/g, '\\\.'));

/**
 * Экранирует специальные символы MarkdownV2 в тексте
 * @param {string} text - входящий текст
 * @returns {string} - текст с экранированными символами
 */
function escapeMarkdownV2(text) {
  // список спецсимволов, которые нужно экранировать
  const escapeChars = [
    '_', '*', '[', ']', '(', ')', '~', '`', '>', '#',
    '+', '-', '=', '|', '{', '}', '.', '!'
  ];

  let escaped = text;
  escapeChars.forEach(char => {
    const regex = new RegExp(`\\${char}`, 'g'); // ищем все вхождения
    escaped = escaped.replace(regex, `\\${char}`); // добавляем обратный слэш
  });

  return escaped;
}

/**
 * віделение дат и времени в тексте для MarkdownV2
 * @param {string} inputText - входящий текст
 * @returns {string} - текст с выделенными данными в формате MarkdownV2
 */
function highlightDatesMarkdown(inputText) {
  // Регулярное выражение для поиска формата HH:MM DD.MM.YYYY
//   const regex = /\b([0-2]\d:[0-5]\d\s\d{2}\.\d{2}\.\d{4})\b/g;
  const regex = /\b([0-2]\d:[0-5]\d)\b/g;

  // Заменяем найденные совпадения на выделенные в Markdown
  const result = escapeMarkdownV2(inputText).replace(regex, '__*$1*__');

  return result;
}




var tmp = await sendMessage(highlightDatesMarkdown(text));
/*



За вашою адресою в даний момент відсутня електроенергія
Причина: Стабілізаційне відключення (Згідно графіку погодинних відключень)
Час початку – 13:00 19.11.2025
Орієнтовний час відновлення електроенергії – до 17:00 19.11.2025



*/ 