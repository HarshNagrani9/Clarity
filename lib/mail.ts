import nodemailer from 'nodemailer';

export async function sendOTPEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verification Code</h2>
                    <p>Use the following code to verify your email address:</p>
                    <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `,
        });
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send verification email');
    }
}
