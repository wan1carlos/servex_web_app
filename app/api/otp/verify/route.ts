import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    console.log('Verifying OTP for email:', email);

    // Initialize OTP store if not exists
    if (!global.otpStore) {
      global.otpStore = new Map<string, OtpData>();
    }

    const storedData = global.otpStore.get(email);
    
    if (!storedData) {
      console.log('No OTP found for email:', email);
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired (5 minutes)
    const now = Date.now();
    const otpAge = now - storedData.timestamp;
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (otpAge > maxAge) {
      console.log('OTP expired for email:', email);
      global.otpStore.delete(email);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      console.log('Too many attempts for email:', email);
      global.otpStore.delete(email);
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log('Invalid OTP for email:', email);
      storedData.attempts += 1;
      global.otpStore.set(email, storedData);
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully
    console.log('OTP verified successfully for email:', email);
    global.otpStore.delete(email); // Clean up after successful verification

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully!'
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}