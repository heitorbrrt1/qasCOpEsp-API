import { Request, Response, NextFunction } from 'express';
import Escala from '../models/escala.model';
import { gerarEscalaCompleta } from '../services/escala.service';

// Importação dos modelos para atualização dos pontos
import Medico from '../models/medico.model';
import Sargento from '../models/sargento.model';
import Socorrista from '../models/socorrista.model';

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

    // Atualiza os pontos dos agentes com base na escala confirmada.
    // Para cada atividade escalada, incrementa 1 ponto (peso = 1)
    for (const dia of dias) {
      for (const tipo in dia.atividades) {
        const atividades = dia.atividades[tipo];
        if (Array.isArray(atividades)) {
          for (const atividade of atividades) {
            // Atualização para Médicos
            if (atividade.medico && atividade.medico !== 'indisponível') {
              await Medico.findOneAndUpdate(
                { nome: atividade.medico },
                { $inc: { [`pontos.${tipo}`]: 1 } }
              );
            }
            // Atualização para Sargentos
            if (atividade.sargento && atividade.sargento !== 'indisponível') {
              await Sargento.findOneAndUpdate(
                { nome: atividade.sargento },
                { $inc: { [`pontos.${tipo}`]: 1 } }
              );
            }
            // Atualização para Socorristas
            if (atividade.socorrista && atividade.socorrista !== 'indisponível') {
              await Socorrista.findOneAndUpdate(
                { nome: atividade.socorrista },
                { $inc: { [`pontos.${tipo}`]: 1 } }
              );
            }
          }
        }
      }
    }

    res.json({ message: 'Escala confirmada e salva com sucesso' });
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
    const { categoria } = req.query;
    let agentes;
    switch(categoria) {
      case 'socorrista':
        agentes = await (await import('../models/socorrista.model')).default.find();
        break;
      case 'sargento':
        agentes = await (await import('../models/sargento.model')).default.find();
        break;
      case 'medico':
        agentes = await (await import('../models/medico.model')).default.find();
        break;
      default:
        res.status(400).json({ error: 'Categoria inválida' });
        return;
    }
    res.json(agentes);
  } catch (error) {
    next(error);
  }
};
