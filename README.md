# Backend do Sistema de Escalas

## 📌 Descrição
Este é o backend de um sistema de gerenciamento de escalas para socorristas, sargentos e médicos. Ele permite a definição de atividades, registro de escalas, gestão de licenças e consulta de histórico.

## 🛠 Tecnologias Utilizadas
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)

## 📂 Estrutura do Projeto
```
backend/
├── src/
│   ├── controllers/    # Controladores das rotas
│   ├── models/         # Modelos do banco de dados (Mongoose)
│   ├── routes/         # Definição das rotas
│   ├── services/       # Serviços e regras de negócio
│   ├── config/         # Configurações do banco e servidor
│   ├── index.ts        # Arquivo principal
├── dist/               # Arquivos compilados em JavaScript
├── package.json        # Dependências e scripts do projeto
├── tsconfig.json       # Configuração do TypeScript
```

## 🚀 Como Rodar o Projeto
### 1. Clonar o repositório
```sh
git clone <URL_DO_REPOSITORIO>
cd backend
```

### 2. Instalar as dependências
```sh
npm install
```

### 3. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto e defina as variáveis necessárias:
```
MONGO_URI=mongodb://localhost:27017/escala_db
PORT=3000
```

### 4. Compilar o TypeScript
```sh
npm run build
```

### 5. Iniciar o servidor
```sh
npm start
```

O backend estará rodando em `http://localhost:3000`.

## 🔥 Principais Endpoints
### 📅 Escalas
- **POST /escala/definir** - Define uma nova escala
- **POST /escala/confirmar** - Confirma e salva uma escala
- **GET /escala/historico** - Consulta escalas por ano e mês

### 👨‍⚕️ Agentes
- **GET /agentes?categoria=socorrista** - Lista agentes por categoria
- **POST /agente/licenca** - Adiciona uma licença a um agente

## 🏗 Contribuição
1. Fork este repositório
2. Crie um branch para sua funcionalidade (`git checkout -b minha-funcionalidade`)
3. Commit suas alterações (`git commit -m 'Minha nova funcionalidade'`)
4. Envie para o branch principal (`git push origin minha-funcionalidade`)
5. Abra um Pull Request 🚀

## 📄 Licença
Este projeto está sob a licença MIT. Sinta-se à vontade para usá-lo e modificá-lo.

