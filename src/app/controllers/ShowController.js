import { Op } from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import Pack from '../models/Pack';
import Recipient from '../models/Recipient';
import File from '../models/File';

class ShowController {
  async index(req, res) {
    const { delivered = 'false' } = req.query;

    const { id } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const deliveries = await Pack.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: delivered === 'true' ? { [Op.ne]: null } : null,
      },
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

    return res.json(deliveries);
  }
}

export default new ShowController();
