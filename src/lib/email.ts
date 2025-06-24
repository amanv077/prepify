import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification - OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${process.env.APP_NAME}</h1>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Thank you for registering with ${process.env.APP_NAME}. To complete your registration, please use the following verification code:
        </p>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
          This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
