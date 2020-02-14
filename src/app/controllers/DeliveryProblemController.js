import * as Yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Pack from '../models/Pack';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import CancelMail from '../jobs/CancelMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const deliveries = await DeliveryProblem.findAll({
      include: [
        {
          model: Pack,
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
        },
      ],
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const { delivery_id } = req.params;

    const deliveryExists = await Pack.findByPk(delivery_id);

    if (!deliveryExists) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const deliveries = await DeliveryProblem.findAll({
      where: {
        delivery_id,
      },
      include: [
        {
          model: Pack,
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
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      problem: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { delivery_id } = req.params;

    const delivery = await Pack.findByPk(delivery_id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const { problem } = req.body;

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id,
      problem,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(id);

    if (!deliveryProblem) {
      return res.status(404).json({ error: 'Delivery problem not found' });
    }

    const { delivery_id } = deliveryProblem;

    const delivery = await Pack.findByPk(delivery_id);

    await delivery.update({
      canceled_at: new Date(),
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

    await Queue.add(CancelMail.key, { delivery });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
