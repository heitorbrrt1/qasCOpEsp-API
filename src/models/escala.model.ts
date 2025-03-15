import mongoose, { Schema, Document } from 'mongoose';

export interface IDia {
  diaDaSemana: string;
  data: Date;
  atividades: any;
}

export interface IEscala extends Document {
  ano: number;
  mes: number;
  semana: number;
  dias: IDia[];
}

const DiaSchema: Schema = new Schema({
  diaDaSemana: String,
  data: Date,
  atividades: Schema.Types.Mixed
});

const EscalaSchema: Schema = new Schema({
  ano: Number,
  mes: Number,
  semana: Number,
  dias: [DiaSchema]
});

export default mongoose.model<IEscala>('Escala', EscalaSchema);
