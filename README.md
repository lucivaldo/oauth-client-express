# Exemplo de aplicação OAuth2 cliente com Express

## Requisitos

- Node (>=18.19.0)

## Configuração inicial

Crie um arquivo chamado **.env** na raiz do projeto com as mesmas variáveis de ambiente do arquivo de exemplo **.env.example** com os valores corretos.

## Como executar a aplicação

`npm run dev`

## Rotas

- */*: Raiz da aplicação.
- */signin*: Rota para iniciar o processo de autenticação.

Após realizar a autenticação com o provedor OAuth, pode-se consultar a seguinte rota:

- */home*: Apenas para exibir os dados do usuário que foram salvos na sessão. Se não tiver usuário na sessão, essa rota provavelmente vai dá erro (não fiz tratamento ainda).
