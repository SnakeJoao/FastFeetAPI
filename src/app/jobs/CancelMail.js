import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class CancelMail {
  get key() {
    return 'CancelMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.Deliveryman.name} <${delivery.Deliveryman.email}>`,
      subject: `A Encomenda ${delivery.product}`,
      template: 'cancel',
      context: {
        deliveryman: delivery.Deliveryman.name,
        product: delivery.product,
        date: format(
          delivery.canceled_at,
          "'dia' dd 'de' MMMM',' 'às' HH:mm'h'",
          { locale: pt }
        ),
      },
    });
  }
}

export default new CancelMail();
