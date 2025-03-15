"use strict";
// backend/src/routes/index.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const escalaController = __importStar(require("../controllers/escala.controller"));
const licencasController = __importStar(require("../controllers/licencas.controller"));
const router = (0, express_1.Router)();
router.post('/definir-atividades', (req, res, next) => {
    escalaController.definirAtividades(req, res, next);
});
router.post('/confirmar-escala', (req, res, next) => {
    escalaController.confirmarEscala(req, res, next);
});
router.get('/historico', (req, res, next) => {
    escalaController.getHistorico(req, res, next);
});
router.get('/agentes', (req, res, next) => {
    escalaController.getAgentes(req, res, next);
});
router.post('/licencas', (req, res, next) => {
    licencasController.addLicenca(req, res, next);
});
exports.default = router;
