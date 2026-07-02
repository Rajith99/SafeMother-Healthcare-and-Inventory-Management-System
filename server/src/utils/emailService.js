import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject: "SafeMother - Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your SafeMother account.</p>
      <p>Use the following token to reset your password. This token is valid for <strong>15 minutes</strong>.</p>
      <p style="font-size: 24px; font-weight: bold; color: #2c3e50;">${resetToken}</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error("Failed to send password reset email");
  }

  return data;
};
