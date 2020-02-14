import * as Yup from 'yup';

import Pack from '../models/Pack';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import PackDetailsMail from '../jobs/PackDetailsMail';
import Queue from '../../lib/Queue';

class PackController {
  async index(req, res) {
    const packs = await Pack.findAll({
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

    return res.json(packs);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id } = req.body;
    const recipientExist = await Recipient.findByPk(recipient_id);

    if (!recipientExist) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const { deliveryman_id } = req.body;
    const deliverymanExist = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExist) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const createPack = await Pack.create(req.body);

    await Queue.add(PackDetailsMail.key, {
      deliverymanExist,
      createPack,
      recipientExist,
    });

    return res.json(createPack);
  }

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string(),
      canceled_at: Yup.date(),
      initial_date: Yup.date(),
      end_date: Yup.date(),
    });

    const searchPack = await Pack.findByPk(id);

    if (!searchPack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, signature_id } = req.body;

    if (recipient_id && searchPack.recipient_id !== recipient_id) {
      const recipientExist = await Recipient.findByPk(recipient_id);

      if (!recipientExist) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
    }

    if (deliveryman_id && searchPack.deliveryman_id !== deliveryman_id) {
      const deliverymanExist = await Deliveryman.findByPk(deliveryman_id);

      if (!deliverymanExist) {
        return res.status(404).json({ error: 'Deliveryman not found' });
      }
    }

    if (signature_id && searchPack.signature_id !== signature_id) {
      const signatureExists = await File.findByPk(signature_id);

      if (!signatureExists) {
        return res.status(404).json({ error: 'Signature not found' });
      }
    }

    const packUpdated = await searchPack.update(req.body);

    return res.json(packUpdated);
  }

  async delete(req, res) {
    const { id } = req.params;

    const searchPack = await Pack.findByPk(id);

    if (!searchPack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    await searchPack.destroy();

    return res.json({ message: 'Pack removed with success' });
  }
}

export default new PackController();
