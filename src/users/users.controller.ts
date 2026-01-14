import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService,User } from './users.service';
import { ResponseDTO } from './dto/responce.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    // GET /users або GET /users?id=1
    @Get()
    getUsers(@Query('id') id?: string) {
        if (id) {
            const user = this.usersService.getUserById(Number(id));
            if (user) {
                return new ResponseDTO<User>([user], 0, '');
                /*return {
                    user,
                    error: { errorCode: 0, errorMessage: '' },
                };*/
            }
            return new ResponseDTO<User>([], 1001, 'User not found');
            /*return {
                user: [],
                error: { errorCode: 1001, errorMessage: 'User not found' },
            };*/
        }
        return new ResponseDTO<User>(this.usersService.getAllUsers(), 0, '');
        /*return {
            users: this.usersService.getAllUsers(),
            error: { errorCode: 0, errorMessage: '' },
        }*/
    }
}