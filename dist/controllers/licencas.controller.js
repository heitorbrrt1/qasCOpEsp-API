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
exports.addLicenca = void 0;
const socorrista_model_1 = __importDefault(require("../models/socorrista.model"));
const sargento_model_1 = __importDefault(require("../models/sargento.model"));
const medico_model_1 = __importDefault(require("../models/medico.model"));
const addLicenca = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoria, agenteId, dataInicio, dataFim } = req.body;
        let agente;
        switch (categoria) {
            case 'socorrista':
                agente = yield socorrista_model_1.default.findById(agenteId);
                break;
            case 'sargento':
                agente = yield sargento_model_1.default.findById(agenteId);
                break;
            case 'medico':
                agente = yield medico_model_1.default.findById(agenteId);
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
        yield agente.save();
        res.json({ message: "Licença adicionada com sucesso" });
    }
    catch (error) {
        next(error);
    }
});
exports.addLicenca = addLicenca;
