import { resetPasswordTemplate } from '../templates/reset-password-email'
import { verifyEmailTemplate } from '../templates/verify-email'
import { getEnvVar } from '../helpers'
import sgMail from '@sendgrid/mail'

export const sendEmail = async (address, subject, html) => {
    await sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    let message = {
        to: address,
        from: process.env.SENDGRID_EMAIL_FROM,
        subject,
        html,
    }

    try {
        const sendEmail = await sgMail.send(message)

        if (!sendEmail) {
            throw new Error('Email has not been sent')
        }

        return sendEmail
    } catch (e) {
        throw new Error(e)
    }
}

const replaceLink = (template, link) => {
    return template.replace('{{{Link}}}', link)
}

export const sendResetPassEmail = async (emailAddress, token) => {
    try {
        const webUrl = getEnvVar('WEB_APP')
        const linkTemplate = replaceLink(resetPasswordTemplate, `${webUrl}/set-password/${token}`)

        return sendEmail(emailAddress, 'Reset Password', linkTemplate)
    } catch (e) {
        throw new Error(e)
    }
}

export const sendVerificationEmail = async (emailAddress, token) => {
    try {
        const webUrl = getEnvVar('WEB_APP')
        const linkTemplate = replaceLink(verifyEmailTemplate, `${webUrl}/verify/email/${token}`)

        return sendEmail(emailAddress, 'Verify Email', linkTemplate)
    } catch (e) {
        throw new Error(e)
    }
}
