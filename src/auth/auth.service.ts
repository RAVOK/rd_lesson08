import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface User {
  id: number;
  username: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<User> {
    // ⚠️ хардкод
    if (username === 'admin' && password === 'admin') {
      return { id: 1, username: 'admin', roles: ['admin'] };
    }
    if (username === 'user' && password === 'user') {
      return { id: 2, username: 'user', roles: ['user'] };
    }
    throw new UnauthorizedException();
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
