import axios from 'axios';
import FormData from 'form-data';

import {
    TELEGRAM_BOT_TOKEN,
    CHAT_ID, 
} from './globals.js';


/**
 * Отправляет фотографию в телеграмм
 * @param {Buffer} photoBuffer - улица полностью как в детеке
 * @param {string} caption - подпись к фотографии
 * @param {string} filename - имя файла фотографии
 * @returns {object} - response telegram api
 */
async function sendPhoto(photoBuffer, caption, filename = 'image.jpg') {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', photoBuffer, { filename });
    formData.append('caption', caption);
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
        headers: formData.getHeaders(),
    });
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
    // formData.append('parse_mode', 'HTML');
    
    // console.log(text);
    // return {};
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, formData, {
        headers: formData.getHeaders(),
    });
}

/**
 * Редактирует ранее отправленное текстовое сообщение в телеграмм
 * @param {number} id - улица полностью как в детеке
 * @param {string} text - улица полностью как в детеке
 * @returns {object} - response telegram api
 */
async function editMessage(id, text) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text', text);
    formData.append('message_id', id);
    // formData.append('parse_mode', 'MarkdownV2');
    // formData.append('parse_mode', 'HTML');
    
    // console.log(id, text);
    // return {};
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, formData, {
        headers: formData.getHeaders(),
    });
}

export {
    sendPhoto,
    sendMessage,
    editMessage,
};