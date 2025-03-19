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
exports.addAgente = void 0;
const medico_model_1 = __importDefault(require("../models/medico.model"));
const sargento_model_1 = __importDefault(require("../models/sargento.model"));
const socorrista_model_1 = __importDefault(require("../models/socorrista.model"));
const addAgente = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoria, nome, pontos } = req.body;
        let agente;
        switch (categoria) {
            case 'medico':
                agente = new medico_model_1.default({ nome, pontos, licencas: [] });
                break;
            case 'sargento':
                agente = new sargento_model_1.default({ nome, pontos, licencas: [] });
                break;
            case 'socorrista':
                agente = new socorrista_model_1.default({ nome, pontos, licencas: [] });
                break;
            default:
                res.status(400).json({ error: "Categoria inválida" });
                return;
        }
        yield agente.save();
        res.status(201).json({ message: 'Agente adicionado com sucesso!' });
    }
    catch (error) {
        next(error);
    }
});
exports.addAgente = addAgente;
