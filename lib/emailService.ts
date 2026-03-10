import db from '@/lib/db'
import nodemailer from 'nodemailer'

export interface SmtpConfig {
  host: string
  port: number
  username: string
  password: string
  encryption: string
  fromEmail: string
  fromName: string
  isEnabled: boolean
}

// Get SMTP configuration from database or fallback to environment variables
export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    // Try to get SMTP settings from database first
    const settings = await db.smtpSettings.findFirst({
      where: { 
        isDefault: true,
        isEnabled: true 
      }
    })

    if (settings) {
      return {
        host: settings.host,
        port: settings.port,
        username: settings.username,
        password: settings.password, // In production, this would be decrypted
        encryption: settings.encryption,
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
        isEnabled: settings.isEnabled
      }
    }

    // Fallback to environment variables if no database settings
    const envHost = process.env.EMAIL_HOST
    const envPort = process.env.EMAIL_PORT
    const envUser = process.env.EMAIL_USER
    const envPass = process.env.EMAIL_PASS
    const envFrom = process.env.EMAIL_FROM

    if (envHost && envPort && envUser && envPass) {
      return {
        host: envHost,
        port: parseInt(envPort),
        username: envUser,
        password: envPass,
        encryption: 'tls', // Default to TLS
        fromEmail: envFrom || envUser,
        fromName: 'SM Alkaff',
        isEnabled: true
      }
    }

    return null
  } catch (error) {
    console.error('Error getting SMTP config:', error)
    return null
  }
}

// Create nodemailer transporter with SMTP configuration
export async function createEmailTransporter() {
  const smtpConfig = await getSmtpConfig()
  
  if (!smtpConfig) {
    throw new Error('No SMTP configuration found. Please configure SMTP settings in the admin panel.')
  }

  if (!smtpConfig.isEnabled) {
    throw new Error('SMTP is disabled. Please enable SMTP in the admin panel.')
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.encryption === 'ssl', // true for 465, false for other ports
    auth: {
      user: smtpConfig.username,
      pass: smtpConfig.password,
    },
    // Add timeout and connection options
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
  })

  return { transporter, config: smtpConfig }
}

// Send email using configured SMTP settings
export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = []
}: {
  to: string
  subject: string
  text: string
  html?: string
  attachments?: any[]
}) {
  const { transporter, config } = await createEmailTransporter()

  const mailOptions = {
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
    attachments
  }

  const info = await transporter.sendMail(mailOptions)
  return { info, config }
}
