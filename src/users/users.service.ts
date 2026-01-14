import { Injectable } from '@nestjs/common';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
}

@Injectable()
export class UsersService {
    private users = [{ id: 1, firstName: 'Olexandr', lastName: 'Rogov' }, { id: 2, firstName: 'Olexandr', lastName: 'Protsko' }];
    getAllUsers(): User[] {
        return this.users;
    }
    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }
}