import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        // Extract the JWT from the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Give to passport the secret key to verify the JWT signature
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  // Called if the JWT is valid, and returns the payload to be attached to the request object
  async validate(payload: any) {
    // The payload contains the userId and username, which can be used to identify the user in the request by using req.user in the controller.
    return { userId: payload.sub, username: payload.username };
  }
}
