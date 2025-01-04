const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    service: 'gmail',
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendMail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return reject(error);
            }
            console.log('Email sent successfully:', info.response);
            resolve(info);
        });
    });
};

module.exports = { transporter, sendMail };
