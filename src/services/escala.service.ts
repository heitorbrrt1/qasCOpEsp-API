import Medico, { IMedico } from '../models/medico.model';
import Sargento, { ISargento } from '../models/sargento.model';
import Socorrista, { ISocorrista } from '../models/socorrista.model';

// Interface para o resultado da escala
export interface EscalaDia {
  diaDaSemana: string;
  data: Date;
  isFeriado: boolean;
  isFimDeSemana: boolean;
  atividades: Record<TipoAtividade, Array<{
    socorrista: string;
    sargento: string;
    medico: string;
  }>>;
}

// Configurações ajustáveis
export interface EscalaConfig {
  maxAtribuicoesPorTipo: number;
  feriados?: Date[];
  logDebug?: boolean;
}

// Tipos das atividades
export type TipoAtividade = 'TFM' | 'NORMAL' | 'OPERACIONAL' | 'NOTURNA' | 'FDSFERIADO' | 'CAMPOVIAGEM';

// Interface para os pontos de cada tipo de atividade
export interface PontosAtividade {
  TFM: number;
  NORMAL: number;
  OPERACIONAL: number;
  NOTURNA: number;
  FDSFERIADO: number;
  CAMPOVIAGEM: number;
}

// Período de licença
export interface Licenca {
  dataInicio: Date;
  dataFim: Date;
}

export interface Agente {
  id: string;
  nome: string;
  pontos: PontosAtividade;
  licencas: Licenca[];
  // Propriedades temporárias para a escala atual:
  scheduleCount?: Record<TipoAtividade, number>;
  disponivel?: boolean;
  bloqueadoAteData?: Date | null;
  ultimasAtividades?: Record<TipoAtividade, Date | null>;
}

/**
 * Busca feriados oficiais de Goiânia (exemplo simplificado)
 * Em produção, substituir por chamada à API da prefeitura
 */
async function getFeriadosGoiania(ano: number): Promise<Date[]> {
  // Feriados fixos de Goiânia (verificar legislação atual)
  return [
    new Date(ano, 0, 1),   // Ano Novo
    new Date(ano, 3, 21),  // Fundação de Goiânia (21/04)
    new Date(ano, 9, 12),  // Nossa Senhora Aparecida
    new Date(ano, 9, 27),  // Dia do Servidor Público
    new Date(ano, 10, 2),  // Finados
    new Date(ano, 10, 20), // Consciência Negra
    new Date(ano, 11, 25), // Natal
  ];
}

/**
 * Verifica se uma data é fim de semana (sábado ou domingo)
 */
function isFimDeSemana(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Gera a escala completa para a semana
 */
export async function gerarEscalaCompleta(
  startDate: Date,
  atividadesPorDia: Record<string, Partial<Record<TipoAtividade, number>>>,
  config: EscalaConfig = { maxAtribuicoesPorTipo: 2 }
): Promise<EscalaDia[]> {
  try {
    // Busca dados dinâmicos
    const [medicos, sargentos, socorristas, feriados] = await Promise.all([
      getMedicos(),
      getSargentos(),
      getSocorristas(),
      getFeriadosGoiania(startDate.getFullYear())
    ]);

    // Inicializa agentes
    const initializeAgentes = (agentes: Agente[]) => {
      agentes.forEach(a => {
        a.scheduleCount = Object.fromEntries(
          Object.keys(a.pontos).map(k => [k, 0])
        ) as Record<TipoAtividade, number>;
        a.disponivel = true;
        a.bloqueadoAteData = null;
      });
    };

    [medicos, sargentos, socorristas].forEach(initializeAgentes);

    // Ordem dos dias da semana
    const diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const escala: EscalaDia[] = [];

    // Função para criar a fila de prioridade dos agentes para uma atividade,
    // utilizando os critérios: menor quantidade de pontos e, em caso de empate,
    // data da última atividade (mais antiga tem prioridade).
    const createPriorityQueue = (agentes: Agente[], tipo: TipoAtividade) => {
      return agentes
        .filter(a => a.disponivel && (a.scheduleCount?.[tipo] ?? 0) < config.maxAtribuicoesPorTipo)
        .sort((a, b) => {
          if (a.pontos[tipo] !== b.pontos[tipo]) {
            return a.pontos[tipo] - b.pontos[tipo]; // menor pontuação primeiro
          } else {
            const dataA = a.ultimasAtividades?.[tipo] ? a.ultimasAtividades[tipo]!.getTime() : 0;
            const dataB = b.ultimasAtividades?.[tipo] ? b.ultimasAtividades[tipo]!.getTime() : 0;
            return dataA - dataB;
          }
        });
    };



    // Processa cada dia
    for (let i = 0; i < diasDaSemana.length; i++) {
      const dataDia = new Date(startDate);
      dataDia.setDate(dataDia.getDate() + i);

      const ehFeriado = feriados.some(f =>
        f.getDate() === dataDia.getDate() &&
        f.getMonth() === dataDia.getMonth() &&
        f.getFullYear() === dataDia.getFullYear()
      );

      const ehFimDeSemana = isFimDeSemana(dataDia);
      const diaKey = diasDaSemana[i];

      const diaEscala: EscalaDia = {
        diaDaSemana: diaKey,
        data: dataDia,
        isFeriado: ehFeriado,
        isFimDeSemana: ehFimDeSemana,
        atividades: {
          TFM: [],
          NORMAL: [],
          OPERACIONAL: [],
          NOTURNA: [],
          FDSFERIADO: [],
          CAMPOVIAGEM: []
        }
      };

      // Atualiza disponibilidade
      const todosAgentes = [...medicos, ...sargentos, ...socorristas];
      todosAgentes.forEach(agent => {
        agent.disponivel = isAgentAvailableForDate(agent, dataDia, config);
      });

      // Processa atividades
      const tiposAtividades: TipoAtividade[] = ['TFM', 'NORMAL', 'OPERACIONAL', 'NOTURNA', 'FDSFERIADO', 'CAMPOVIAGEM'];

      for (const tipo of tiposAtividades) {
        const quantidade = atividadesPorDia[diaKey]?.[tipo] || 0;

        if (tipo === 'TFM' && (ehFimDeSemana || ehFeriado)) {
          continue;
        }

        if (tipo === 'FDSFERIADO' && !ehFimDeSemana && !ehFeriado) {
          continue;
        }

        for (let occ = 0; occ < quantidade; occ++) {
          const escolher = (categoria: Agente[]) => {
            const queue = createPriorityQueue(categoria, tipo);
            if (queue.length === 0) return "indisponível";

            const escolhido = queue[0];
            escolhido.scheduleCount![tipo]++;
            escolhido.ultimasAtividades![tipo] = new Date(dataDia);

            if (tipo === 'NOTURNA') {
              const bloqueioAte = new Date(dataDia);
              bloqueioAte.setDate(bloqueioAte.getDate() + 1);
              escolhido.bloqueadoAteData = bloqueioAte;

              if (config.logDebug) {
                console.log(`Noturna: ${escolhido.nome} bloqueado até ${bloqueioAte}`);
              }
            }
            return escolhido.nome;
          };

          diaEscala.atividades[tipo].push({
            socorrista: escolher(socorristas),
            sargento: escolher(sargentos),
            medico: escolher(medicos)
          });
        }
      }
      escala.push(diaEscala);
    }

    return escala;
  } catch (error) {
    throw new Error(`Falha na geração da escala: ${(error as Error).message}`);
  }
}

// Função para verificar se um agente está disponível para uma data específica
function isAgentAvailableForDate(agent: Agente, date: Date, config: EscalaConfig): boolean {
  // Validação de licenças
  agent.licencas.forEach(licenca => {
    if (licenca.dataInicio > licenca.dataFim) {
      throw new Error(`Licença inválida para o agente ${agent.nome}: Data início após data fim`);
    }
  });

  if (agent.bloqueadoAteData && date <= agent.bloqueadoAteData) {
    if (config.logDebug) {
      console.log(`Agente ${agent.nome} bloqueado até ${agent.bloqueadoAteData}`);
    }
    return false;
  }

  return !agent.licencas.some(licenca => date >= licenca.dataInicio && date <= licenca.dataFim);
}

// Funções para buscar os agentes do banco de dados
export async function getMedicos(): Promise<Agente[]> {
  const medicos = await Medico.find().lean() as IMedico[];
  return medicos.map(doc => ({
    id: (doc._id as any).toString(),
    nome: doc.nome,
    pontos: doc.pontos,
    licencas: doc.licencas,
    ultimasAtividades: {
      TFM: null,
      NORMAL: null,
      OPERACIONAL: null,
      NOTURNA: null,
      FDSFERIADO: null,
      CAMPOVIAGEM: null
    }
  }));
}

export async function getSargentos(): Promise<Agente[]> {
  const sargentos = await Sargento.find().lean() as ISargento[];
  return sargentos.map(doc => ({
    id: (doc._id as any).toString(),
    nome: doc.nome,
    pontos: doc.pontos,
    licencas: doc.licencas,
    ultimasAtividades: {
      TFM: null,
      NORMAL: null,
      OPERACIONAL: null,
      NOTURNA: null,
      FDSFERIADO: null,
      CAMPOVIAGEM: null
    }
  }));
}

export async function getSocorristas(): Promise<Agente[]> {
  const socorristas = await Socorrista.find().lean() as ISocorrista[];
  return socorristas.map(doc => ({
    id: (doc._id as any).toString(),
    nome: doc.nome,
    pontos: doc.pontos,
    licencas: doc.licencas,
    ultimasAtividades: {
      TFM: null,
      NORMAL: null,
      OPERACIONAL: null,
      NOTURNA: null,
      FDSFERIADO: null,
      CAMPOVIAGEM: null
    }
  }));
}
