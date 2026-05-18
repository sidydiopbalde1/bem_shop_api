import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export type GoogleUser = {
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(config: ConfigService) {
    const clientID     = config.get<string>('GOOGLE_CLIENT_ID')     || '';
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET') || '';
    const callbackURL  = config.get<string>('GOOGLE_CALLBACK_URL')  || 'http://localhost:3000/auth/google/callback';

    super({ clientID, clientSecret, callbackURL, scope: ['email', 'profile'] });

    // Ce log confirme que la strategy s'est enregistrée dans Passport
    this.logger.log(`✅ GoogleStrategy enregistrée — clientID: ${clientID.slice(0, 12)}...`);
  }

  validate(_at: string, _rt: string, profile: Profile): GoogleUser {
    const { id, name, emails, photos } = profile;
    if (!emails?.[0]?.value) {
      throw new UnauthorizedException('Email Google non disponible');
    }
    return {
      providerId: id,
      email:      emails[0].value,
      firstName:  name?.givenName  ?? '',
      lastName:   name?.familyName ?? '',
      avatar:     photos?.[0]?.value ?? '',
    };
  }
}
