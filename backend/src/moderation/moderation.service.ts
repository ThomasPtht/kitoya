import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    let reportedUserId: string;

    if (dto.targetType === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.targetId },
        select: { id: true },
      });
      if (!user) throw new NotFoundException('User not found');
      reportedUserId = user.id;
    } else {
      const jersey = await this.prisma.jersey.findUnique({
        where: { id: dto.targetId },
        select: { userId: true },
      });
      if (!jersey) throw new NotFoundException('Jersey not found');
      reportedUserId = jersey.userId;
    }

    if (reportedUserId === reporterId) {
      throw new BadRequestException('You cannot report your own content');
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reportedUserId,
        reason: dto.reason,
        details: dto.details?.trim() || null,
      },
    });

    // Apple requires reports to be handled within 24h: notify the team right away.
    // A mail failure must not make the report fail, it is stored in the DB anyway.
    try {
      await this.resend.emails.send({
        from: 'Kitoya <no-reply@kitoya.com>',
        to: 'hello@kitoya.com',
        subject: `[Report] ${dto.targetType} - ${dto.reason}`,
        html: `
          <p><strong>Report ID:</strong> ${report.id}</p>
          <p><strong>Target:</strong> ${dto.targetType} ${escapeHtml(dto.targetId)}</p>
          <p><strong>Reported user ID:</strong> ${reportedUserId}</p>
          <p><strong>Reporter ID:</strong> ${reporterId}</p>
          <p><strong>Reason:</strong> ${dto.reason}</p>
          <p><strong>Details:</strong> ${escapeHtml(dto.details ?? 'none')}</p>
          <p>To be reviewed within 24 hours.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Report ${report.id} email notification failed`, error);
    }

    return { success: true };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    });

    return { blocked: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.deleteMany({ where: { blockerId, blockedId } });
    return { blocked: false };
  }

  async getBlockedUsers(blockerId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { blockerId },
      include: { blocked: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return blocks.map((b) => ({
      id: b.blocked.id,
      username: b.blocked.username,
    }));
  }
}
