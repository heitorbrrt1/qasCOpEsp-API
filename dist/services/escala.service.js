"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicos = getMedicos;
exports.getSargentos = getSargentos;
exports.getSocorristas = getSocorristas;
exports.gerarEscalaCompleta = gerarEscalaCompleta;
const medico_model_1 = __importDefault(require("../models/medico.model"));
const sargento_model_1 = __importDefault(require("../models/sargento.model"));
const socorrista_model_1 = __importDefault(require("../models/socorrista.model"));
/**
 * Busca feriados oficiais de Goiânia (exemplo simplificado)
 * Em produção, substituir por chamada à API da prefeitura
 */
function getFeriadosGoiania(ano) {
    return __awaiter(this, void 0, void 0, function* () {
        // Feriados fixos de Goiânia (verificar legislação atual)
        return [
            new Date(ano, 0, 1), // Ano Novo
            new Date(ano, 3, 21), // Fundação de Goiânia (21/04)
            new Date(ano, 9, 12), // Nossa Senhora Aparecida
            new Date(ano, 9, 27), // Dia do Servidor Público
            new Date(ano, 10, 2), // Finados
            new Date(ano, 10, 20), // Consciência Negra
            new Date(ano, 11, 25), // Natal
            // Adicionar outros conforme legislação municipal
        ];
    });
}
/**
 * Verifica se uma data é fim de semana (sábado ou domingo)
 */
function isFimDeSemana(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}
// Função genérica para mapear documentos do Mongoose para o tipo Agente
function mapDocumentToAgente(doc) {
    return {
        id: doc._id.toString(),
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
    };
}
// Funções para buscar os agentes do banco de dados
// Funções para buscar os agentes do banco de dados
function getMedicos() {
    return __awaiter(this, void 0, void 0, function* () {
        const medicos = yield medico_model_1.default.find().lean();
        return medicos.map(doc => ({
            id: doc._id.toString(),
            nome: doc.nome,
            pontos: doc.pontos,
            licencas: doc.licencas
        }));
    });
}
function getSargentos() {
    return __awaiter(this, void 0, void 0, function* () {
        const sargentos = yield sargento_model_1.default.find().lean();
        return sargentos.map(doc => ({
            id: doc._id.toString(),
            nome: doc.nome,
            pontos: doc.pontos,
            licencas: doc.licencas
        }));
    });
}
function getSocorristas() {
    return __awaiter(this, void 0, void 0, function* () {
        const socorristas = yield socorrista_model_1.default.find().lean();
        return socorristas.map(doc => ({
            id: doc._id.toString(),
            nome: doc.nome,
            pontos: doc.pontos,
            licencas: doc.licencas
        }));
    });
}
/**
 * Verifica se um agente está disponível para uma data específica
 */
function isAgentAvailableForDate(agent, date, config) {
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
/**
 * Gera a escala completa para a semana
 */
function gerarEscalaCompleta(startDate_1, atividadesPorDia_1) {
    return __awaiter(this, arguments, void 0, function* (startDate, atividadesPorDia, config = { maxAtribuicoesPorTipo: 2 }) {
        var _a;
        try {
            // Busca dados dinâmicos
            const [medicos, sargentos, socorristas, feriados] = yield Promise.all([
                getMedicos(),
                getSargentos(),
                getSocorristas(),
                getFeriadosGoiania(startDate.getFullYear())
            ]);
            // Inicializa agentes
            const initializeAgentes = (agentes) => {
                agentes.forEach(a => {
                    a.scheduleCount = Object.fromEntries(Object.keys(a.pontos).map(k => [k, 0]));
                    a.disponivel = true;
                    a.bloqueadoAteData = null;
                });
            };
            [medicos, sargentos, socorristas].forEach(initializeAgentes);
            // Ordem dos dias da semana
            const diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
            const escala = [];
            // Função otimizada para seleção de agentes
            const createPriorityQueue = (agentes, tipo) => {
                return agentes
                    .filter(a => { var _a, _b; return a.disponivel && ((_b = (_a = a.scheduleCount) === null || _a === void 0 ? void 0 : _a[tipo]) !== null && _b !== void 0 ? _b : 0) < config.maxAtribuicoesPorTipo; })
                    .sort((a, b) => {
                    var _a, _b, _c, _d;
                    const dataA = ((_b = (_a = a.ultimasAtividades) === null || _a === void 0 ? void 0 : _a[tipo]) === null || _b === void 0 ? void 0 : _b.getTime()) || 0;
                    const dataB = ((_d = (_c = b.ultimasAtividades) === null || _c === void 0 ? void 0 : _c[tipo]) === null || _d === void 0 ? void 0 : _d.getTime()) || 0;
                    return dataA - dataB;
                });
            };
            // Processa cada dia
            for (let i = 0; i < diasDaSemana.length; i++) {
                const dataDia = new Date(startDate);
                dataDia.setDate(dataDia.getDate() + i);
                const ehFeriado = feriados.some(f => f.getDate() === dataDia.getDate() &&
                    f.getMonth() === dataDia.getMonth() &&
                    f.getFullYear() === dataDia.getFullYear());
                const ehFimDeSemana = isFimDeSemana(dataDia);
                const diaKey = diasDaSemana[i];
                const diaEscala = {
                    diaDaSemana: diaKey,
                    data: dataDia,
                    isFeriado: ehFeriado, // Corrigido: usa a variável ehFeriado
                    isFimDeSemana: ehFimDeSemana, // Corrigido: usa a variável ehFimDeSemana
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
                const tiposAtividades = ['TFM', 'NORMAL', 'OPERACIONAL', 'NOTURNA', 'FDSFERIADO', 'CAMPOVIAGEM'];
                for (const tipo of tiposAtividades) {
                    const quantidade = ((_a = atividadesPorDia[diaKey]) === null || _a === void 0 ? void 0 : _a[tipo]) || 0;
                    if (tipo === 'TFM' && (ehFimDeSemana || ehFeriado)) {
                        continue;
                    }
                    if (tipo === 'FDSFERIADO' && !ehFimDeSemana && !ehFeriado) {
                        continue;
                    }
                    for (let occ = 0; occ < quantidade; occ++) {
                        const escolher = (categoria) => {
                            const queue = createPriorityQueue(categoria, tipo);
                            if (queue.length === 0)
                                return "indisponível";
                            const escolhido = queue[0];
                            escolhido.scheduleCount[tipo]++;
                            escolhido.ultimasAtividades[tipo] = new Date(dataDia);
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
        }
        catch (error) {
            throw new Error(`Falha na geração da escala: ${error.message}`);
        }
    });
}
