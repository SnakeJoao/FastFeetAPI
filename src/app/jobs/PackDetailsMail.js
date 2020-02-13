import Mail from '../../lib/Mail';

class PackDetailsMail {
  get key() {
    return 'PackDetailsMail';
  }

  async handle({ data }) {
    const { deliverymanExist, createPack, recipientExist } = data;

    await Mail.sendMail({
      to: `${deliverymanExist.name} <${deliverymanExist.email}>`,
      subject: 'Nova encomenda disponível!',
      template: 'packDetails',
      context: {
        deliveryman: deliverymanExist.name,
        product: createPack.product,
        name: recipientExist.destinatary,
        street: recipientExist.street,
        number: recipientExist.number,
        complement: recipientExist.complement,
        state: recipientExist.state,
        city: recipientExist.city,
        postalcode: recipientExist.postal_code,
      },
    });
  }
}

export default new PackDetailsMail();
