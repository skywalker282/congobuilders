/**
 * inquiry controller
 */

import { factories } from '@strapi/strapi';

const uid = 'api::inquiry.inquiry';

export default factories.createCoreController(uid, ({ strapi }) => ({
  async createMine(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized();

    const body = ctx.request.body as { data?: Record<string, unknown> } | undefined;
    const data = body?.data;
    const message = data?.message;
    const propertyDocumentId = data?.property;
    if (
      typeof message !== 'string' ||
      message.trim().length < 10 ||
      message.trim().length > 3000 ||
      typeof propertyDocumentId !== 'string' ||
      propertyDocumentId.length < 1 ||
      propertyDocumentId.length > 128
    ) {
      return ctx.badRequest('Please provide a valid property inquiry.');
    }

    const property = await strapi.documents('api::property.property').findOne({
      documentId: propertyDocumentId,
    });
    if (!property) return ctx.notFound('Property not found.');
    if (property.availability !== 'AVAILABLE') {
      return ctx.throw(409, 'Property is no longer available for reservation.');
    }

    const inquiry = await strapi.entityService.create(uid, {
      data: {
        message: message.trim(),
        date: new Date().toISOString().slice(0, 10),
        status: 'pending',
        customer: userId,
        property: property.id,
        publishedAt: new Date().toISOString(),
      },
    });

    return ctx.created({ data: { id: inquiry.documentId ?? inquiry.id } });
  },

  async findMine(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized();

    const inquiries = await strapi.entityService.findMany(uid, {
      filters: {
        customer: { id: { $eq: userId } },
      },
      populate: { property: true },
      sort: { date: 'desc' },
    });

    ctx.body = { data: inquiries };
    return ctx.body;
  },
}));
