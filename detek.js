console.log('start');

import schedule from 'node-schedule';

import {
    STREET,
    HOUSE,
    PHOTO_WHITE_BORDER_SIZE,
    UPDATE_DATE_SPLITER,
    HIDE_INFO_TEXT,
    NOT_SHUTDONW_TEXT,
    PREFIX_EMOJI,
} from './globals.js';

import {
    sendPhoto,
    sendMessage,
    editMessage,
} from './telegramBotFunctions.js';

import {
    addWhiteBorderToImage,
    escapeMarkdownV2,
    highlightDatesMarkdown,
} from './helpersFunctions.js';

import {
    getDetekData,
} from './puppeteerFunctions.js';

let lastUpdateDate = '00:00 00.00.0000';
let thisStartUpdateDate = '00:00 00.00.0000';
let lastTextInfo = '';
let lastMessageId = 0;

const lastStateClassLists = ['', ''];


/** * Формирует текст сообщения для отправки или редактирования
 * @param {string} textInfo - текстовая информация о состоянии
 * @param {string} nowUpdateDate - дата и время последнего обновления данных
 * @param {boolean} isEdit - флаг, указывающий, является ли это редактированием сообщения
 * @returns {string} - подготовленный текст сообщения
 */
function prepareMessageText(textInfo, nowUpdateDate, isEdit = false) {
    return (
        highlightDatesMarkdown(
            textInfo.includes(NOT_SHUTDONW_TEXT)
            ? PREFIX_EMOJI.NOT_SHUTDONW
            : PREFIX_EMOJI.SHUTDOWN +
            textInfo.replace(HIDE_INFO_TEXT, '')
        ) +
        escapeMarkdownV2(
            'Данні оновлено: \n' + 
            isEdit ? `${thisStartUpdateDate}\n` : '' + 
            nowUpdateDate
        )
    );
}

async function main() {
    console.log('main start');
    const {textInfoFull, graphics} = await getDetekData(STREET, HOUSE);
    const [textInfo, nowUpdateDate] = [
        ...textInfoFull.split(UPDATE_DATE_SPLITER).map(s => s.replace(/<[^>]*>/gi, '')),
        '00:00 00.00.0000'
    ];
    console.log(new Date(), lastUpdateDate, nowUpdateDate);
    if (nowUpdateDate !== lastUpdateDate) {
        lastUpdateDate = nowUpdateDate;
        if (textInfo === lastTextInfo && lastMessageId) {
            await editMessage(
                lastMessageId,
                prepareMessageText(textInfo, nowUpdateDate, true)
            );
            console.log('edit message', lastMessageId)
        }
        else {
            const messageReturn = await sendMessage(
                prepareMessageText(textInfo, nowUpdateDate, false)
            );
            lastMessageId = messageReturn?.data?.result?.message_id || 0;
            lastTextInfo = textInfo;
            thisStartUpdateDate = nowUpdateDate;
            console.log('send message', lastMessageId);
        }
    }

    graphics.forEach(async ({screenshotBuffer, screenshotCaptionText, stateClassList}, index) => {
        if (stateClassList === lastStateClassLists[index]) {
            console.log('skip photo send index', index);
            return;
        }
        if (stateClassList.replace(/cell-non-scheduled/g, '') === '') {
            console.log('skip photo send empty index', index);
            lastStateClassLists[index] = stateClassList;
            return;
        }
        const photoWithBorder = await addWhiteBorderToImage(screenshotBuffer, PHOTO_WHITE_BORDER_SIZE);
        await sendPhoto(
            photoWithBorder,
            PREFIX_EMOJI.LIGHTNING + screenshotCaptionText,
            `detek_${index}_${Date.now()}.png`
        );
        lastStateClassLists[index] = stateClassList;
        console.log('send photo index', index);
    });
    

    console.log('main end');
}

await main();


const rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 5); //кожні (остання цифра) хвилин
const medocJob = schedule.scheduleJob(rule, main);

console.log('end');