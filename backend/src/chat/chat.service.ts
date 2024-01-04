import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

    async createChannel(data: Prisma.ChannelCreateInput) {
        return this.prisma.channel.create({
            data
        });
    }

    async findChannel(data: Prisma.ChannelFindUniqueArgs) {
        return this.prisma.channel.findUnique(data);
    }
}
