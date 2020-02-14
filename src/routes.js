import { Router } from 'express';
import multer from 'multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileConroller';
import PackController from './app/controllers/PackController';
import ShowController from './app/controllers/ShowController';
import TakeController from './app/controllers/TakeController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

// routes.get('/', (req, res) => res.json({ message: 'Hello World' }));

routes.post('/sessions', SessionController.store);

/**
 * Rotas de entrega
 */
routes.get('/deliveryman/:id/deliveries', ShowController.index);
routes.put(
  '/deliveryman/:deliveryman_id/take/:delivery_id',
  TakeController.update
);
routes.put(
  '/deliveryman/:deliveryman_id/delivery/:delivery_id',
  upload.single('file'),
  DeliveryController.update
);

/**
 * Rotas de problema de entrega
 */

routes.post('/delivery/:delivery_id/problems', DeliveryProblemController.store);

routes.use(authMiddleware);

/**
 * Rota de destinatário
 */
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

/**
 * Rota de entregadores
 */
routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

/**
 * Rotas de problema de entrega para administrador
 */

routes.get('/deliveries/problems', DeliveryProblemController.index);
routes.get('/delivery/:delivery_id/problems', DeliveryProblemController.show);
routes.delete('/problem/:id/cancel', DeliveryProblemController.delete);

/**
 * Rota de upload de arquivo
 */
routes.post('/files', upload.single('file'), FileController.store);

/**
 * Rota de encomendas
 */
routes.get('/packs', PackController.index);
routes.post('/packs', PackController.store);
routes.put('/packs/:id', PackController.update);
routes.delete('/packs/:id', PackController.delete);

export default routes;
