// src/controllers/agentes.controller.ts
import { Request, Response, NextFunction } from 'express';
import Medico from '../models/medico.model';
import Sargento from '../models/sargento.model';
import Socorrista from '../models/socorrista.model';

export const addAgente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoria, nome, pontos } = req.body;

    let agente;
    switch (categoria) {
      case 'medico':
        agente = new Medico({ nome, pontos, licencas: [] });
        break;
      case 'sargento':
        agente = new Sargento({ nome, pontos, licencas: [] });
        break;
      case 'socorrista':
        agente = new Socorrista({ nome, pontos, licencas: [] });
        break;
      default:
        res.status(400).json({ error: "Categoria inválida" });
        return;
    }

    await agente.save();
    res.status(201).json({ message: 'Agente adicionado com sucesso!' });
  } catch (error) {
    next(error);
  }
};
