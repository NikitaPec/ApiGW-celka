import nodemailer from "nodemailer";

class MailService {
  transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  async sendActivationMail(email: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Активация личного кабинета на ${process.env.API_URL}`,
      text: `${link}`,
    });
  }

  async sendRecoveryMail(email: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Восстановление пароля на ${process.env.API_URL}`,
      text: `${link}`,
    });
  }
}

export default new MailService();
