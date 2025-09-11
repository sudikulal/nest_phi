import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from 'generated/prisma';

@Injectable()
export class UserDbService extends PrismaClient {
    constructor() {
        super();
    }

    async getUserById(id: number) {
        return this.user.findUnique({
            where: { id },
        });
    }

    async findUser(
        where: Prisma.UserWhereInput,
        select?: Prisma.UserSelect
    ) {
        return this.user.findFirst({
            where,
            select,
        });
    }

    async createUser(data: Prisma.UserCreateInput) {
        return this.user.create({
            data,
        });
    }

    async updateUser(id: number, data: Prisma.UserUpdateInput) {
        return this.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: number) {
        return this.user.delete({
            where: { id },
        });
    }

}
