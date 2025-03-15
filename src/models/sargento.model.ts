import mongoose, { Schema, Document } from 'mongoose';

export interface ISargento extends Document {
  nome: string;
  pontos: {
    TFM: number;
    NORMAL: number;
    OPERACIONAL: number;
    NOTURNA: number;
    FDSFERIADO: number;
    CAMPOVIAGEM: number;
  };
  licencas: Array<{
    dataInicio: Date;
    dataFim: Date;
  }>;
}

const SargentoSchema: Schema = new Schema({
  nome: { type: String, required: true },
  pontos: {
    TFM: { type: Number, default: 0 },
    NORMAL: { type: Number, default: 0 },
    OPERACIONAL: { type: Number, default: 0 },
    NOTURNA: { type: Number, default: 0 },
    FDSFERIADO: { type: Number, default: 0 },
    CAMPOVIAGEM: { type: Number, default: 0 }
  },
  licencas: [
    {
      dataInicio: Date,
      dataFim: Date
    }
  ]
});

export default mongoose.model<ISargento>('Sargento', SargentoSchema);
