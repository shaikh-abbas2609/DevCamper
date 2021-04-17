const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const refresh_token = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri)
oAuth2Client.setCredentials({ refresh_token })

const sendEmail = async function(options){
        const acess_token = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'shaikh.abbas2609@gmail.com',
                type:'OAuth2',
                clientId:client_id,
                clientSecret:client_secret,
                refreshToken:refresh_token,
                accessToken: acess_token
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const mailOptions = {
            from: 'Mohammad Abbas <shaikh.abbas2609@gmail.com>',
            to:options.email,
            subject:options.subject,
            text:options.message
        }

        await transport.sendMail(mailOptions);

}

module.exports = sendEmail