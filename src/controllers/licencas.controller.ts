import { Request, Response, NextFunction } from 'express';
import Socorrista from '../models/socorrista.model';
import Sargento from '../models/sargento.model';
import Medico from '../models/medico.model';

export const addLicenca = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoria, agenteId, dataInicio, dataFim } = req.body;
    let agente;
    switch(categoria) {
      case 'socorrista':
        agente = await Socorrista.findById(agenteId);
        break;
      case 'sargento':
        agente = await Sargento.findById(agenteId);
        break;
      case 'medico':
        agente = await Medico.findById(agenteId);
        break;
      default:
        res.status(400).json({ error: "Categoria inválida" });
        return;
    }
    if (!agente) {
      res.status(404).json({ error: "Agente não encontrado" });
      return;
    }
    agente.licencas.push({ dataInicio, dataFim });
    await agente.save();
    res.json({ message: "Licença adicionada com sucesso" });
  } catch (error) {
    next(error);
  }
};
