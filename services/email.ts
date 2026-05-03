export interface HighRiskEmailPayload {
  recipient: string
  summary: string
  explanation: string
  recommendedAction: string
}

export async function sendHighRiskEmail(payload: HighRiskEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromAddress) {
    console.warn('[sendHighRiskEmail] Missing Resend configuration, email not sent')
    return
  }

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #0f172a; line-height: 1.6;">
      <h1 style="color: #c2410c;">⚠️ High risk detected</h1>
      <p>${payload.summary}</p>
      <p><strong>Explanation:</strong> ${payload.explanation}</p>
      <p><strong>Recommended action:</strong> ${payload.recommendedAction}</p>
      <p style="color: #475569; font-size: 14px; margin-top: 24px;">SignalX is monitoring your live data and will notify you of any new alerts.</p>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: payload.recipient,
      subject: '⚠️ ALERT: High risk detected by SignalX',
      html,
    }),
  })
}
