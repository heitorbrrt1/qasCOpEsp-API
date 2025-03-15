import { Request, Response, NextFunction } from 'express';
import Escala from '../models/escala.model';

const gerarEscala = async (atividadesPorDia: any) => {
  const diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const escala = diasDaSemana.map(dia => {
    const atividades = atividadesPorDia[dia] || {};
    const atividadesResult: any = {};
    for (const atividade in atividades) {
      const quantidade = atividades[atividade];
      if (quantidade === 1) {
        atividadesResult[atividade] = {
          socorrista: "indisponível",
          sargento: "indisponível",
          medico: "indisponível"
        };
      } else if (quantidade > 1) {
        atividadesResult[atividade] = [];
        for (let i = 0; i < quantidade; i++) {
          atividadesResult[atividade].push({
            socorrista: "indisponível",
            sargento: "indisponível",
            medico: "indisponível"
          });
        }
      }
    }
    return {
      diaDaSemana: dia,
      data: new Date(), // Em produção, use datas reais conforme a semana
      atividades: atividadesResult
    };
  });
  return escala;
};

export const definirAtividades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { atividadesPorDia } = req.body;
    const dias = await gerarEscala(atividadesPorDia);
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
