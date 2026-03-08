import * as nodemailer from "nodemailer";

export class MailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: process.env.USER_EMAIL,
				pass: process.env.PASSWORD_EMAIL,
			},
		});
	}

	async sendUserConfirmation(username: string, email: string, code: string) {
		await this.transporter.sendMail({
			from: '"Simple Messenger" d47701206@gmail.com',
			to: email,
			subject: "Confirme seu email",
			html: `<div class="container"><h1>Olá, ${username} o código para autenticação é: </h1><br><h2>${code}</h2></div>`,
		});
	}
}
