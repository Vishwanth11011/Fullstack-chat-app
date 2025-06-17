import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Your App <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email',
      html: `<p>Your OTP for signup is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};