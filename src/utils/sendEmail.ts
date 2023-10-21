import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import path from 'path';
import { HTMLEmailOptions } from '../types.js';

const __dirname = path.resolve();

const templatePath = path.join(__dirname, 'public', 'emails', 'emailTemplate.html');

/**
 * Sends an email to the recipient, based on the HTML template
 * @param email Email address of the recipient
 * @param subject Subject of the email
 * @param htmlOptions Options for the HTML template
 */
const sendEmail = async (email: string, subject: string, htmlOptions: HTMLEmailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.DEFAULT_EMAIL,
                pass: process.env.DEFAULT_PASSWORD
            }
        });

        const template = await readFile(templatePath, 'utf-8');

        const $ = cheerio.load(template);

        const { text, imgSrc, link, user, important } = htmlOptions;

        if (!user.subscribed && !important) return;

        $('#title').text(subject);

        $('p#greeting').text(`Hi ${user.email.substring(0, email.indexOf('@'))},`);

        $('p#text').text(text);

        if (imgSrc) {
            $('img#optional-img').attr('src', imgSrc).removeAttr('style');
        }

        if (link) {
            $('div#link-container').removeAttr('style');
            $('a#link').attr('href', link.href).text(link.text);
        }

        $('a#unsubscribe').attr('href', `${process.env.CLIENT_URL}/user/unsubscribe/${user._id}`);

        const html = $.html();

        const mailOptions = {
            from: process.env.DEFAULT_EMAIL,
            to: email,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
    }
};

export default sendEmail;
