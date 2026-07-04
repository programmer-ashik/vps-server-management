import { config } from '../config/env.js'
import { HttpError } from '../core/http/error.types.js'
import { logger } from '../core/logging/logger.js'

export async function sendServerDeliveryEmail({
  toEmail,
  customerName,
  serverName,
  serverDetails,
  delivery,
}) {
  if (!config.brevoApiKey) {
    throw new HttpError(
      503,
      'Email service is not configured. Set BREVO_API_KEY in environment.',
      'EMAIL_NOT_CONFIGURED'
    )
  }

  const subject = `Your server is ready: ${serverName}`
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${customerName},</h2>
      <p>Your server <strong>${serverName}</strong> is ready. Below are your access details.</p>
      <h3>Server Details</h3>
      <p>${serverDetails || 'N/A'}</p>
      <h3>Login / Access Details</h3>
      <ul>
        <li><strong>IP:</strong> ${delivery.serverIp}</li>
        <li><strong>Username:</strong> ${delivery.serverUsername}</li>
        <li><strong>Password:</strong> ${delivery.serverPassword}</li>
        <li><strong>Panel URL:</strong> ${delivery.serverPanelUrl || 'N/A'}</li>
      </ul>
      ${
        delivery.additionalNotes
          ? `<h3>Additional Notes</h3><p>${delivery.additionalNotes}</p>`
          : ''
      }
      <p>If you need help, please reply to this email or contact our support team.</p>
      <p>Thank you for your business.</p>
    </div>
  `

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': config.brevoApiKey,
    },
    body: JSON.stringify({
      sender: {
        name: config.brevoSenderName,
        email: config.brevoSenderEmail,
      },
      to: [{ email: toEmail, name: customerName }],
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    logger.error('Brevo email failed', { status: response.status, body })
    throw new HttpError(502, 'Failed to send email', 'EMAIL_SEND_FAILED')
  }

  return response.json()
}

export async function sendVpsProvisionedEmail({
  toEmail,
  customerName,
  subscriptions,
}) {
  if (!config.brevoApiKey) {
    throw new HttpError(
      503,
      'Email service is not configured. Set BREVO_API_KEY in environment.',
      'EMAIL_NOT_CONFIGURED'
    )
  }

  const subject = `Your VPS subscription${subscriptions.length > 1 ? 's are' : ' is'} ready`
  const subscriptionSections = subscriptions
    .map((item, index) => {
      const details = item.deliveryDetails ?? {}
      return `
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin-top: 0;">VPS ${index + 1}</h3>
          <ul>
            <li><strong>Server:</strong> ${details.serverName || 'N/A'}</li>
            <li><strong>IP:</strong> ${details.serverIp || 'N/A'}</li>
            <li><strong>Username:</strong> ${details.serverUsername || 'N/A'}</li>
            <li><strong>Password:</strong> ${details.serverPassword || 'N/A'}</li>
            <li><strong>Panel URL:</strong> ${details.serverPanelUrl || 'N/A'}</li>
            <li><strong>Plan:</strong> ${item.subscriptionPlan}</li>
            <li><strong>Price:</strong> ${item.subscriptionPrice}</li>
            <li><strong>Expiry:</strong> ${new Date(item.subscriptionEndDate).toLocaleDateString()}</li>
          </ul>
          ${
            details.additionalNotes
              ? `<p><strong>Notes:</strong> ${details.additionalNotes}</p>`
              : ''
          }
        </div>
      `
    })
    .join('')

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <h2>Hello ${customerName},</h2>
      <p>Your VPS provisioning is complete. The details for your assigned server${subscriptions.length > 1 ? 's' : ''} are below.</p>
      ${subscriptionSections}
      <p>If you need help, please reply to this email or contact our support team.</p>
    </div>
  `

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': config.brevoApiKey,
    },
    body: JSON.stringify({
      sender: {
        name: config.brevoSenderName,
        email: config.brevoSenderEmail,
      },
      to: [{ email: toEmail, name: customerName }],
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    logger.error('Brevo email failed', { status: response.status, body })
    throw new HttpError(502, 'Failed to send email', 'EMAIL_SEND_FAILED')
  }

  return response.json()
}

export async function trySendVpsProvisionedEmail(input) {
  try {
    await sendVpsProvisionedEmail(input)
    return { sent: true, error: null }
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
