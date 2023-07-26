import nodemailer from 'nodemailer';

const sendEmail = async (email: string, subject: string, text: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.DEFAULT_EMAIL,
                pass: process.env.DEFAULT_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.DEFAULT_EMAIL,
            to: email,
            subject: subject,
            text: text,
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
    }
};

export default sendEmail;