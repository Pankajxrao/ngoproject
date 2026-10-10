
import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export async function sendPickupEmail({
  to,
  foodName,
  ngoName,
}: {
  to: string;
  foodName: string;
  ngoName: string;
}) {
  if (!emailUser || !emailPassword) {
    throw new Error("Email environment variables are missing");
  }

  await transporter.sendMail({
    from: emailUser,
    to,
    subject: "Your food donation has been picked up",
    text: `Hello,

Your food donation "${foodName}" has been picked up by ${ngoName}.

NGO: ${ngoName}
Donation: ${foodName}
Status: Picked Up

Thank you for helping reduce food waste!

Regards,
Food Donation Platform`,
  });
}
