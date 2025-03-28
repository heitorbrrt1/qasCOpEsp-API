
# qasCOpEsp-API

Uma API para gerenciamento de escalas e atividades de equipes de emergência (médicos, sargentos e socorristas) utilizando MongoDB, Express e TypeScript.

## Sumário

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Execução](#instalação-e-execução)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Descrição

O **qasCOpEsp-API** é uma API desenvolvida para gerenciar a escala de atividades de equipes de emergência. O sistema gera escalas considerando feriados, fins de semana e regras específicas para cada tipo de atividade, garantindo uma distribuição justa de tarefas entre os profissionais. A lógica de priorização dos agentes baseia-se no histórico de pontos e na data da última atividade, permitindo um gerenciamento dinâmico e eficiente.

## Funcionalidades

- **Gerar Escala Completa:** Cria a escala semanal com base na data inicial e na quantidade de atividades por dia.
- **Confirmação de Escala:** Salva a escala gerada no banco de dados e atualiza os pontos dos agentes conforme as atividades realizadas.
- **Histórico de Escalas:** Consulta escalas passadas filtradas por ano e mês.
- **Gerenciamento de Agentes:** Adição de novos agentes (médicos, sargentos e socorristas) e consulta de agentes por categoria.
- **Gestão de Licenças:** Permite a atribuição de períodos de licença para os agentes, impedindo a alocação em dias indisponíveis.

## Tecnologias Utilizadas

- **Node.js** e **Express** para construção da API.
- **MongoDB** com **Mongoose** para modelagem e persistência de dados.
- **TypeScript** para tipagem estática e maior robustez no desenvolvimento.
- **Nodemon** para desenvolvimento com recarga automática.

## Endpoints da API
- **POST /api/definir-atividades:** Gera a escala completa para os dias especificados.
``` json
{
  "atividadesPorDia": {
    "segunda": { "NORMAL": 2, "OPERACIONAL": 1 },
    "terca": { "NORMAL": 2, "OPERACIONAL": 1 }
  },
  "startDate": "2025-01-06T00:00:00.000Z",
  "config": {
    "maxAtribuicoesPorTipo": 2,
    "logDebug": true
  }
}
```
- **POST /api/confirmar-escala:** Salva a escala gerada e atualiza os pontos dos agentes. Body Exemplo:
``` json
{
  "ano": 2025,
  "mes": 1,
  "semana": 2,
  "dias": [ ... ]
}
```

- **GET /api/historico?ano=2025&mes=1:** Retorna o histórico de escalas para o mês e ano especificados.
- **GET /api/agentes?categoria=medico:** Consulta agentes de uma categoria específica (medico, sargento ou socorrista).
- **POST /api/agentes:**  Adiciona um novo agente. Body Exemplo:
``` json
{
  "categoria": "medico",
  "nome": "Dr. Fulano",
  "pontos": {
    "TFM": 0,
    "NORMAL": 0,
    "OPERACIONAL": 0,
    "NOTURNA": 0,
    "FDSFERIADO": 0,
    "CAMPOVIAGEM": 0
  }
}
```

- **POST /api/licencas:** Adiciona uma licença a um agente. Body Exemplo:
``` json
{
  "categoria": "sargento",
  "agenteId": "id_do_agente",
  "dataInicio": "2025-02-01T00:00:00.000Z",
  "dataFim": "2025-02-10T00:00:00.000Z"
}
```

## Licença
[Este projeto está licensiado sob a MIT License](/guides/content/editing-an-existing-page#modifying-front-matter)
Este projeto está licensiado sob a MIT License