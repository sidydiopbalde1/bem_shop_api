import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

export type FacebookUser = {
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('FACEBOOK_APP_ID', 'not-configured'),
      clientSecret: config.get('FACEBOOK_APP_SECRET', 'not-configured'),
      callbackURL: config.get('FACEBOOK_CALLBACK_URL', 'http://localhost:3000/auth/facebook/callback'),
      profileFields: ['id', 'emails', 'name'],
      scope: ['email'],
    });
  }

  validate(_at: string, _rt: string, profile: Profile, done: Function): void {
    const { id, name, emails } = profile;
    done(null, {
      providerId: id,
      email: emails?.[0]?.value ?? '',
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
    });
  }
}
