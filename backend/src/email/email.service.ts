import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

const TRANSLATIONS = {
  en: {
    subject: 'Your Kitoya Reset Code',
    title: 'Password Reset Code',
    intro: 'You requested a password reset for your Kitoya account.',
    codeInfo: 'Here is your verification code (valid for 15 minutes):',
    ignoreNote: "If you didn't request this, you can safely ignore this email.",
  },
  fr: {
    subject: 'Votre code de réinitialisation Kitoya',
    title: 'Code de réinitialisation du mot de passe',
    intro:
      'Vous avez demandé une réinitialisation du mot de passe pour votre compte Kitoya.',
    codeInfo: 'Voici votre code de vérification (valide 15 minutes) :',
    ignoreNote:
      "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
  },
  es: {
    subject: 'Tu código de restablecimiento de Kitoya',
    title: 'Código de restablecimiento de contraseña',
    intro: 'Has solicitado restablecer la contraseña de tu cuenta de Kitoya.',
    codeInfo:
      'Aquí está tu código de verificación (válido durante 15 minutos):',
    ignoreNote:
      'Si no has solicitado esto, puedes ignorar este correo con tranquilidad.',
  },
};

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordResetEmail(
    email: string,
    code: string,
    locale: 'en' | 'fr' | 'es' = 'en',
  ) {
    const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

    await this.resend.emails.send({
      from: 'Kitoya <no-reply@kitoya.com>',
      to: email,
      subject: t.subject,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>${t.title}</h2>
          <p>${t.intro}</p>
          <p>${t.codeInfo}</p>
          
          <div style="background: #f4f4f4; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; color: #05C785; margin: 20px 0;">
            ${code}
          </div>
          
          <p>${t.ignoreNote}</p>
        </div>
      `,
    });
  }
}
