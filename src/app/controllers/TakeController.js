import { Op } from 'sequelize';
import * as Yup from 'yup';
import { parseISO, isBefore, getHours, startOfDay, endOfDay } from 'date-fns';

import Pack from '../models/Pack';
import Deliveryman from '../models/Deliveryman';

class TakeController {
  async update(req, res) {
    const schema = Yup.object().shape({
      initial_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, delivery_id } = req.params;

    const delivery = await Pack.findByPk(delivery_id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found.' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }

    if (delivery.initial_date) {
      if (delivery.canceled_at || delivery.end_date) {
        return res.status(400).json({ error: 'Delivery close' });
      }
      return res.status(400).json({ error: 'Delivery already start' });
    }

    const { initial_date } = req.body;
    const parsedDate = parseISO(initial_date);

    if (isBefore(parsedDate, startOfDay(new Date()))) {
      return res.status(401).json({ error: 'Date invalid' });
    }

    if (getHours(parsedDate) <= 8 || getHours(parsedDate) >= 18) {
      return res.status(401).json({
        error:
          'The retirement schedule is only available between 08:00 and 18:00',
      });
    }

    const deliveries = await Pack.findAll({
      where: {
        deliveryman_id,
        initial_date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
    });

    if (deliveries.length >= 5) {
      return res.status(400).json({
        error: 'Delivery Man has already 5 deliveries on the day.',
      });
    }

    const updateDelivery = await delivery.update(req.body);

    return res.json(updateDelivery);
  }
}

export default new TakeController();
