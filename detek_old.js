const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const STREET = process.env.STREET;
const HOUSE = process.env.HOUSE;

// const UPDATE_DATE_SPLITER = 'Дата оновлення інформації – ';
const UPDATE_DATE_SPLITER = '<span class="_update_info">Дата оновлення інформації</span> – ';

const HIDE_INFO_TEXT = `
 Якщо наразі у Вас немає світла, імовірно, виникла аварійна ситуація та інформація з'явиться на сайті трошки пізніше.
Якщо світла немає тривалий час – прохання оформити заявку нижче.`

let lastUpdateDate = '00:00 00.00.0000';
let thsStartUpdateDate = '00:00 00.00.0000';
let lastTextInfo = '';
let lastMessageId = 0;

let browser = null;

async function getDetekText(street = 'улица полностью как в детеке', house = 'номер дома полностью', typeDelay = 120) {
//     browser = browser || await puppeteer.launch({
//         headless: false,
//         defaultViewport: null,
//         args: ['--start-maximized'] 
//     });
    browser = browser || await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto('https://www.dtek-kem.com.ua/ua/shutdowns');

    try{
        await page.waitForSelector('.modal__close');
        await page.$eval('.modal__close', el => el.click());
    }
    catch (exc) { console.log('no modal'); }

    await page.waitForSelector('#street');
    await page.type('#street', street, { delay: typeDelay });
    await page.waitForSelector('#streetautocomplete-list>div');
    await page.$eval('#streetautocomplete-list>div', el => el.click());
    await page.waitForSelector('#house_num:not([disabled])');
    await page.type('#house_num', house, { delay: typeDelay });
    await page.waitForSelector('#house_numautocomplete-list>div');
    await page.$eval('#house_numautocomplete-list>div', el => el.click());
    await page.waitForSelector('#showCurOutage');

    const textInfo = await page.$eval('#showCurOutage>p', el => el.innerHTML.replaceAll('<br>', '\n'));
    /*
    textInfo:
      'За Вашою адресою наразі не зафіксовано відключень. \n' +
      " Якщо наразі у Вас немає світла, імовірно, виникла аварійна ситуація та інформація з'явиться на сайті трошки пізніше.\n" +
      'Якщо світла немає тривалий час – прохання оформити заявку нижче.\n' +
      '\n' +
      'Дата оновлення інформації – 11:19 13.07.2024'
    */
    await page.close();
    // await browser.close();
    return textInfo;
}

async function sendMessage(text) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text', text);
    // formData.append('parse_mode', 'MarkdownV2');
    // formData.append('parse_mode', 'HTML');
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, formData, {
        headers: formData.getHeaders(),
    });
}


async function editMessage(id, text) { // TODO!!!
    // curl -X POST "https://api.telegram.org/botВАШ_ТОКЕН_БОТА/editMessageText" -d "chat_id=ID_ЧАТА" -d "message_id=ID_СООБЩЕНИЯ" -d "text=Новый текст сообщения"

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text', text);
    formData.append('message_id', id);
    // formData.append('parse_mode', 'MarkdownV2');
    // formData.append('parse_mode', 'HTML');
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, formData, {
        headers: formData.getHeaders(),
    });
}

async function main() {
    const textInfoFull = await getDetekText(STREET, HOUSE);
    const [textInfo, nowUpdateDate] = [
        ...textInfoFull.split(UPDATE_DATE_SPLITER),
        '00:00 00.00.0000'
    ];
    console.log(new Date(), lastUpdateDate, nowUpdateDate);
    if (nowUpdateDate !== lastUpdateDate) {
        lastUpdateDate = nowUpdateDate;
        if (textInfo === lastTextInfo && lastMessageId) {
            await editMessage(
                lastMessageId,
                textInfo
                    // .replaceAll('<strong>','*')
                    // .replaceAll('</strong>','*')
                    .replace(/<[^>]*>/gi, '')
                    .replace(HIDE_INFO_TEXT, '') + 
                'Данні оновлено: \n' + 
                thsStartUpdateDate + '\n' + nowUpdateDate
            );
            console.log('edit message', lastMessageId)
        }
        else {
            const messageReturn = await sendMessage(
                textInfo
                    // .replaceAll('<strong>','*')
                    // .replaceAll('</strong>','*')
                    .replace(/<[^>]*>/gi, '')
                    .replace(HIDE_INFO_TEXT, '') + 
                'Данні оновлено: \n' + 
                nowUpdateDate
            );
            lastMessageId = messageReturn?.data?.result?.message_id || 0;
            lastTextInfo = textInfo;
            thsStartUpdateDate = nowUpdateDate;
            console.log('send message', lastMessageId);
        }
    }
}

// sendMessage('bot restart');
main();

const rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 5); //кожні (остання цифра) хвилин
const medocJob = schedule.scheduleJob(rule, main);