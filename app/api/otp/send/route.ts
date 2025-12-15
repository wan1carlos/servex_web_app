import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Type for OTP storage
interface OtpData {
  otp: string;
  timestamp: number;
  attempts: number;
}

// Extend global to include our OTP store
declare global {
  var otpStore: Map<string, OtpData> | undefined;
}

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('OTP send request body:', body);
    const { email } = body;

    if (!email) {
      console.log('Email is missing');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Validating email:', email);
    // Validate Gmail format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      console.log('Email failed Gmail validation:', email);
      return NextResponse.json(
        { error: 'Please use a valid Gmail address' },
        { status: 400 }
      );
    }

    console.log('Email is valid Gmail, generating and sending OTP');

    // Initialize OTP store if not exists
    if (!global.otpStore) {
      global.otpStore = new Map<string, OtpData>();
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for', email, ':', otp);

    // Store OTP with timestamp and attempts
    global.otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    try {
      // Send OTP email via Gmail SMTP
      console.log('Sending OTP email to:', email);
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your ServEx OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">ServEx Verification Code</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 3px;">${otp}</h1>
            </div>
            <p style="color: #666; text-align: center; margin: 20px 0;">
              This code will expire in 5 minutes. Please do not share this code with anyone.
            </p>
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        `,
      };

      const emailResponse = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully via Gmail:', emailResponse.messageId);

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to ${email}! Check your Gmail inbox.`,
        // For development/testing: show OTP in response
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Clean up stored OTP on failure
      global.otpStore.delete(email);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}