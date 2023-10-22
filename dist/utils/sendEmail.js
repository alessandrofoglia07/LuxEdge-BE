var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import path from 'path';
const __dirname = path.resolve();
const templatePath = path.join(__dirname, 'public', 'emails', 'emailTemplate.html');
/**
 * Sends an email to the recipient, based on the HTML template
 * @param email Email address of the recipient
 * @param subject Subject of the email
 * @param htmlOptions Options for the HTML template
 */
const sendEmail = (email, subject, htmlOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.DEFAULT_EMAIL,
                pass: process.env.DEFAULT_PASSWORD
            }
        });
        const template = yield readFile(templatePath, 'utf-8');
        const $ = cheerio.load(template);
        const { text, imgSrc, link, user, important } = htmlOptions;
        if (!user.subscribed && !important)
            return;
        $('#title').text(subject);
        $('p#greeting').text(`Hi ${user.email.substring(0, email.indexOf('@'))},`);
        $('p#text').text(text);
        $('span#year').text(new Date().getFullYear().toString());
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
        yield transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.log(err);
    }
});
export default sendEmail;
