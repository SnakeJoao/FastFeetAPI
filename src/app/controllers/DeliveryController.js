import * as Yup from 'yup';
import { parseISO, startOfDay, isBefore } from 'date-fns';

import Pack from '../models/Pack';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Recipient from '../models/Recipient';

class DeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, delivery_id } = req.params;

    const delivery = await Pack.findByPk(delivery_id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'The signature needs to be sent' });
    }

    if (!delivery.initial_date) {
      return res
        .status(401)
        .json({ error: 'This delivery has not yet been withdrawn' });
    }

    if (delivery.canceled_at || delivery.end_date) {
      return res.status(400).json({ error: 'Delivery closed' });
    }

    const { end_date } = req.body;
    const parsedDate = parseISO(end_date);

    if (isBefore(parsedDate, startOfDay(new Date()))) {
      return res.status(401).json({ error: 'Date invalid' });
    }

    const { originalname, filename } = req.file;

    const file = await File.create({
      originalname,
      filename,
    });

    await delivery.update({
      end_date,
      signature_id: file.id,
    });

    await delivery.reload({
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'canceled_at',
        'initial_date',
        'end_date',
      ],
      include: [
        {
          model: Recipient,
          attributes: [
            'destinatary',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'postal_code',
          ],
        },
        {
          model: Deliveryman,
          include: [
            {
              model: File,
              as: 'avatar',
            },
          ],
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path'],
        },
      ],
    });

    return res.json(delivery);
  }
}

export default new DeliveryController();
