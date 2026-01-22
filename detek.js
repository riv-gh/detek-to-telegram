import schedule from 'node-schedule';

import {
    CITY,
    STREET,
    HOUSE,
    PHOTO_WHITE_BORDER_SIZE,
    UPDATE_DATE_SPLITTER,
    HIDE_INFO_TEXT_ARRAY,
    SEND_EMPTY_SHUTDOWN_DAY,

    SHUTDOWN_TEXT,
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
    delay,
    removeSubstrings,
} from './helpersFunctions.js';

import {
    getDetekData,
    browserIsLaunched,
    browserClose,
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
            (textInfo.includes(SHUTDOWN_TEXT) ? PREFIX_EMOJI.SHUTDOWN : PREFIX_EMOJI.NOT_SHUTDOWN) +
            removeSubstrings(
                textInfo,
                HIDE_INFO_TEXT_ARRAY
            ),
        ) +
        escapeMarkdownV2(
            'Дані оновлено: \n' + 
            (isEdit ? `${thisStartUpdateDate}\n` : '') +
            nowUpdateDate
        )
    );
}

async function main() {
    const {textInfoFull, graphics} = await getDetekData(CITY, STREET, HOUSE);
    const [textInfo, nowUpdateDate] = [
        ...textInfoFull.split(UPDATE_DATE_SPLITTER),
        '00:00 00.00.0001'
    ];

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

    graphics.forEach(async ({
        screenshotBuffer, screenshotCaptionText, stateClassList,
        isError, error
    }, index) => {
        if (isError) {
            console.warn(`error to screenshot ${screenshotCaptionText||''}`, error);
            return;
        }
        if (stateClassList === lastStateClassLists[index]) {
            console.log('skip photo send', screenshotCaptionText);
            return;
        }
        if (!SEND_EMPTY_SHUTDOWN_DAY && stateClassList.replace(/cell-non-scheduled/g, '') === '') {
            console.log('skip photo send empty', screenshotCaptionText);
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
        console.log('send photo', screenshotCaptionText);
    });
    
}


async function tryMain() {
    try {
        await main();
    } catch (error) {
        console.error('Error in scheduled job:', error);
        console.log('Closing browser...');
        await browserClose();
        //await delay(5000);
        //tryMain();
    }
}

await tryMain();
await delay(5000);

const rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 5); //кожні (остання цифра) хвилин
const medocJob = schedule.scheduleJob(rule, tryMain);
