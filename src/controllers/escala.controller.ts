import { Request, Response, NextFunction } from 'express';
import Escala from '../models/escala.model';
import { gerarEscalaCompleta } from '../services/escala.service';


export const definirAtividades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { atividadesPorDia, startDate, config } = req.body;
    // startDate: data inicial da escala
    // config: configurações opcionais (ex: logDebug, maxAtribuicoesPorTipo)
    const dias = await gerarEscalaCompleta(new Date(startDate), atividadesPorDia, config);
    res.json({ dias });
  } catch (error) {
    next(error);
  }
};

export const confirmarEscala = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ano, mes, semana, dias } = req.body;
    const novaEscala = new Escala({ ano, mes, semana, dias });
    await novaEscala.save();

    // Atualize os pontos dos agentes conforme necessário.

    res.json({ message: "Escala confirmada e salva com sucesso" });
  } catch (error) {
    next(error);
  }
};

export const getHistorico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ano, mes } = req.query;
    const escalas = await Escala.find({ ano, mes });
    res.json(escalas);
  } catch (error) {
    next(error);
  }
};

export const getAgentes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoria } = req.query; // Exemplo: categoria=socorrista
    let agentes;
    switch(categoria) {
      case 'socorrista':
        // Importe e use o modelo correto
        agentes = await (await import('../models/socorrista.model')).default.find();
        break;
      case 'sargento':
        agentes = await (await import('../models/sargento.model')).default.find();
        break;
      case 'medico':
        agentes = await (await import('../models/medico.model')).default.find();
        break;
      default:
        res.status(400).json({ error: "Categoria inválida" });
        return;
    }
    res.json(agentes);
  } catch (error) {
    next(error);
  }
};
