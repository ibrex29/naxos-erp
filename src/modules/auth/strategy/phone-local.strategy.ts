// phone-local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '@/modules/auth/auth.service';

@Injectable()
export class PhoneLocalStrategy extends PassportStrategy(Strategy, 'phone-local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'phoneNumber' }); 
  }

  async validate(phoneNumber: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(phoneNumber, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return { ...user };
  }
}
