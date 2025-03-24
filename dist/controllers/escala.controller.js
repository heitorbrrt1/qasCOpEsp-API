"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getAgentes = exports.getHistorico = exports.confirmarEscala = exports.definirAtividades = void 0;
const escala_model_1 = __importDefault(require("../models/escala.model"));
const escala_service_1 = require("../services/escala.service");
// Importação dos modelos para atualização dos pontos
const medico_model_1 = __importDefault(require("../models/medico.model"));
const sargento_model_1 = __importDefault(require("../models/sargento.model"));
const socorrista_model_1 = __importDefault(require("../models/socorrista.model"));
const definirAtividades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { atividadesPorDia, startDate, config } = req.body;
        // startDate: data inicial da escala
        // config: configurações opcionais (ex: logDebug, maxAtribuicoesPorTipo)
        const dias = yield (0, escala_service_1.gerarEscalaCompleta)(new Date(startDate), atividadesPorDia, config);
        res.json({ dias });
    }
    catch (error) {
        next(error);
    }
});
exports.definirAtividades = definirAtividades;
const confirmarEscala = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ano, mes, semana, dias } = req.body;
        const novaEscala = new escala_model_1.default({ ano, mes, semana, dias });
        yield novaEscala.save();
        // Atualiza os pontos dos agentes com base na escala confirmada.
        // Para cada atividade escalada, incrementa 1 ponto (peso = 1)
        for (const dia of dias) {
            for (const tipo in dia.atividades) {
                const atividades = dia.atividades[tipo];
                if (Array.isArray(atividades)) {
                    for (const atividade of atividades) {
                        // Atualização para Médicos
                        if (atividade.medico && atividade.medico !== 'indisponível') {
                            yield medico_model_1.default.findOneAndUpdate({ nome: atividade.medico }, { $inc: { [`pontos.${tipo}`]: 1 } });
                        }
                        // Atualização para Sargentos
                        if (atividade.sargento && atividade.sargento !== 'indisponível') {
                            yield sargento_model_1.default.findOneAndUpdate({ nome: atividade.sargento }, { $inc: { [`pontos.${tipo}`]: 1 } });
                        }
                        // Atualização para Socorristas
                        if (atividade.socorrista && atividade.socorrista !== 'indisponível') {
                            yield socorrista_model_1.default.findOneAndUpdate({ nome: atividade.socorrista }, { $inc: { [`pontos.${tipo}`]: 1 } });
                        }
                    }
                }
            }
        }
        res.json({ message: 'Escala confirmada e salva com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
exports.confirmarEscala = confirmarEscala;
const getHistorico = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ano, mes } = req.query;
        const escalas = yield escala_model_1.default.find({ ano, mes });
        res.json(escalas);
    }
    catch (error) {
        next(error);
    }
});
exports.getHistorico = getHistorico;
const getAgentes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoria } = req.query;
        let agentes;
        switch (categoria) {
            case 'socorrista':
                agentes = yield (yield Promise.resolve().then(() => __importStar(require('../models/socorrista.model')))).default.find();
                break;
            case 'sargento':
                agentes = yield (yield Promise.resolve().then(() => __importStar(require('../models/sargento.model')))).default.find();
                break;
            case 'medico':
                agentes = yield (yield Promise.resolve().then(() => __importStar(require('../models/medico.model')))).default.find();
                break;
            default:
                res.status(400).json({ error: 'Categoria inválida' });
                return;
        }
        res.json(agentes);
    }
    catch (error) {
        next(error);
    }
});
exports.getAgentes = getAgentes;
