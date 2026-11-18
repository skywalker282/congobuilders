export default {
  routes: [
    {
      method: 'POST',
      path: '/me/inquiries',
      handler: 'inquiry.createMine',
      config: {
        auth: { scope: ['api::inquiry.inquiry.createMine'] },
      },
    },
    {
      method: 'GET',
      path: '/me/inquiries',
      handler: 'inquiry.findMine',
      config: {
        auth: { scope: ['api::inquiry.inquiry.findMine'] },
      },
    },
  ],
};
