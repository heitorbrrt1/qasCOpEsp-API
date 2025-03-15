import { Router, Request, Response, NextFunction } from 'express';
import * as escalaController from '../controllers/escala.controller';
import * as licencasController from '../controllers/licencas.controller';

const router: Router = Router();

router.post('/definir-atividades', (req: Request, res: Response, next: NextFunction) => {
  escalaController.definirAtividades(req, res, next);
});

router.post('/confirmar-escala', (req: Request, res: Response, next: NextFunction) => {
  escalaController.confirmarEscala(req, res, next);
});

router.get('/historico', (req: Request, res: Response, next: NextFunction) => {
  escalaController.getHistorico(req, res, next);
});

router.get('/agentes', (req: Request, res: Response, next: NextFunction) => {
  escalaController.getAgentes(req, res, next);
});

router.post('/licencas', (req: Request, res: Response, next: NextFunction) => {
  licencasController.addLicenca(req, res, next);
});

export default router;
