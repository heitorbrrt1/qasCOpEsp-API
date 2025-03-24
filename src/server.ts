import * as express from 'express'
import mongoose from 'mongoose'
import routes from './routes'

const app = express.default()
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api', routes);

const mongoURI = 'mongodb://localhost:27017/escalaDB';

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error('Erro ao conectar no MongoDB', err);
  });
