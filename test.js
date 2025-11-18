console.log('start');


// const puppeteer = require('puppeteer');
// const schedule = require('node-schedule');
// const axios = require('axios');
// const FormData = require('form-data');
// const dotenv = require('dotenv');

import puppeteer from 'puppeteer';
import schedule from 'node-schedule';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';


dotenv.config();


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const STREET = process.env.STREET;
const HOUSE = process.env.HOUSE;



const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';

const UPDATE_DATE_SPLITER = '<span class="_update_info">Дата оновлення інформації</span> – ';

const HIDE_INFO_TEXT = `
 Якщо наразі у Вас немає світла, імовірно, виникла аварійна ситуація та інформація з'явиться на сайті трошки пізніше.
Якщо світла немає тривалий час – прохання оформити заявку нижче.`

let lastUpdateDate = '00:00 00.00.0000';
let thsStartUpdateDate = '00:00 00.00.0000';
let lastTextInfo = '';
let lastMessageId = 0;

let browser = null;

const browserParams =
    (process.platform === 'win32') //на виндовс отображем бразур для удобного тестирования
    ? { headless: false, defaultViewport: null, args: ['--start-maximized'] }
    : { args: ['--no-sandbox', '--disable-setuid-sandbox'] };


/**
 * Дает задержку в милисикундах через Promise
 * @param {number} ms - задержка в милисекундах
 */
function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

/**
 * Получает текст с сайта детек (необходимы browser и browserParams)
 * @param {string} street - улица полностью как в детеке
 * @param {string} house - номер дома полностью
 * @param {number} typeDelay - задержка между нажатиями при "печати" (120 по умолчанию)
 * @returns {string} - текст про отключение электроэнерии
 */
async function getDetekText(street, house, typeDelay = 120) {
    browser = browser || await puppeteer.launch(browserParams);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(DETEK_LINK);

    // проверяем наличие модального окна 
    try{
        await page.waitForSelector('.modal__close');
        await page.$eval('.modal__close', el => el.click());
        /* console.log('close modal'); */
    }
    catch { /*console.log('no modal');*/ }

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

    // временно убрано для тестов
    // await page.close();

    return textInfo;
}


/**
 * Отправляет текстовое сообщение в телеграмм
 * @param {string} text - улица полностью как в детеке
 * @returns {object} - response telegram api
 */
async function sendMessage(text) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text', text);
    // formData.append('parse_mode', 'MarkdownV2');
    formData.append('parse_mode', 'HTML');
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, formData, {
        headers: formData.getHeaders(),
    });
}



async function main() {
    console.log('main start');
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
                    // .replace(/<[^>]*>/gi, '')
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
    console.log('main end');
}

await main();




console.log('end');