const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore } = require('firebase-admin/firestore')
const nodemailer = require('nodemailer')
const fs = require('fs').promises // Using fs.promises for async operations
const path = require('path')
const handlebars = require('handlebars')

// Load environment variables
require('dotenv').config()

// Initialize Firestore
const db = getFirestore()

const sendWelcomeEmails = onCall(async (request) => {
  const { updatedObj: data } = request.data

  try {
    console.log('Starting welcome email process for:', data.email)

    // Validate required data
    if (!data.email || !data.firstName || !data.lastName) {
      throw new HttpsError('invalid-argument', 'Missing required user data')
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    // Send both emails
    const [welcomeResult, loginDetailsResult] = await Promise.all([
      sendWelcomeEmail(transporter, data),
      sendLoginDetailsEmail(transporter, data),
    ])

    // Save email records to Firestore
    try {
      await db.collection('sentEmails').add({
        userId: data.uid || data.id,
        recipientEmail: data.email,
        emailType: 'welcome_emails',
        sentAt: new Date(),
        welcomeMessageId: welcomeResult.messageId,
        loginDetailsMessageId: loginDetailsResult.messageId,
      })
      console.log('Email records saved to Firestore')
    } catch (dbError) {
      console.error('Failed to save email records:', dbError)
      // Continue execution even if DB save fails
    }

    return {
      success: true,
      welcomeMessageId: welcomeResult.messageId,
      loginDetailsMessageId: loginDetailsResult.messageId,
      data,
    }
  } catch (error) {
    console.error('Error sending welcome emails:', error)
    throw new HttpsError('internal', 'Failed to send welcome emails', error)
  }
})

// Helper function to send welcome email
async function sendWelcomeEmail(transporter, userData) {
  try {
    // Read the welcome template
    const templatePath = path.join(__dirname, '../email templates/welcome/welcome.hbs')
    const templateSource = await fs.readFile(templatePath, 'utf8')
    console.log('Welcome template loaded successfully')

    // Compile the template
    const template = handlebars.compile(templateSource)

    // Format expiration date if it exists
    let formattedExpiry = 'N/A'
    if (userData.expDate) {
      formattedExpiry = new Date(userData.expDate).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    // Prepare data for the template
    const templateData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      orgName: userData.company || userData.orgName || 'Your Organization',
      email: userData.email,
      expires: formattedExpiry,
    }

    // Generate HTML content
    const htmlContent = template(templateData)

    // Send email
    const info = await transporter.sendMail({
      from: '"Easy Data Systems" <' + process.env.EMAIL_USER + '>',
      to: userData.to,
      subject: `Welcome to Easy Data Systems, ${userData.firstName}!`,
      html: htmlContent,
    })

    console.log('Welcome email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

// Helper function to send login details email
async function sendLoginDetailsEmail(transporter, userData) {
  try {
    // Read the login details template
    const templatePath = path.join(
      __dirname,
      '../email templates/welcome/loginDetails.hbs'
    )
    const templateSource = await fs.readFile(templatePath, 'utf8')
    console.log('Login details template loaded successfully')

    // Compile the template
    const template = handlebars.compile(templateSource)

    // Prepare data for the template
    const templateData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      company: userData.company || userData.orgName || 'Your Organization',
      password: userData.password || userData.tempPassword || '[Your temporary password]',
    }

    // Generate HTML content
    const htmlContent = template(templateData)

    // Send email
    const info = await transporter.sendMail({
      from: '"Easy Data Systems" <' + process.env.EMAIL_USER + '>',
      to: userData.to,
      subject: `Your Login Details for Easy Data Systems`,
      html: htmlContent,
    })

    console.log('Login details email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending login details email:', error)
    throw error
  }
}

module.exports = {
  sendWelcomeEmails,
}
