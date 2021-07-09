Walkthrough API Marketplace Magalu
==================================
                                             __
                                            / /
     ___  ___  __     __ _  ___  ___  ___  / /_ __    _______  __ _
    / _ `/ _ \/ /    /  ' \/ _ `/ _ `/ _ `/ / // /   / __/ _ \/  ' \
    \_,_/ ___/_/ () /_/_/_/\_,_/\_, /\_,_/_/\_,_/ () \__/\___/_/_/_/
       / /                      /  /
       ``                       ```

# Introdução

A API do Marketplace da Magalu oferece acesso programático a uma variedade de
funcionalidades, expostas como endpoints REST, acessíveis via HTTPS. Com esta
API você pode:

- Escrever aplicações que utilizam todos os recursos da API, agindo em nome de
  um usuário final, como por exemplo, um parceiro Magalu vendendo produtos no
  marketplace

- Consultar seus pedidos de venda, aceitá-los e realizar os passos essenciais
  para sua operação, incluindo faturamento e envio

- Atender e responder a chamados abertos sobre suas vendas e os produtos
  vendidos

- Consultar e cadastrar SKUs do seu estoque, utilizando como base produtos do
  nosso catálogo central

entre outras atividades no ecossistema Magalu.

A API permite que sejam feitas requisições tanto pela perspectiva de um
Consumidor quanto a de um Vendedor na plataforma, retornando conteúdo
apropriado para cada uma destas perspectivas. Por exemplo, uma consulta
de Pedidos realizada por um usuário com o perfil de Consumidor retorna
os pedidos realizados por este consumidor; uma consulta de pedidos realizada
por um usuário Vendedor retorna os pedidos que este vendedor recebeu, e que
ele precisa confirmar, faturar e entregar.

Todas os recursos da API são expostas pelo domínio api.magalu.com. A
documentação e ferramentas para desenvolvedores, inclusive gerenciamento de
tokens de acesso, residem em `https://dev.magalu.com/` -- para se cadastrar basta
ter uma conta Github. Esperamos você lá!

# Autenticação e Autorização

A forma mais simples de acessar a API Magalu é usando um API Key,
que pode ser gerada em `https://dev.magalu.com/user`. Neste documento, onde
aparecer `MYAPIKEY` deve ser feita a substituição pela chave gerada.

> Observação: este documento contém exemplos que assumem que você tenha as
> ferramentas de comando de linha `curl` e `jq` instaladas, que em Linux estão
> disponíveis como pacotes do sistema, e em outros sistemas operacionais, em
> repositórios públicos.

Para testar se sua API Key está funcionando, use o seguinte endpoint:

    $ curl -H "X-API-Key: MYAPIKEY" https://api.magalu.com/account/v1/whoami
    {
         "uuid": "5b02cdaf-9a93-4cfe-959a-ec989bd414e5",
         "preferred_email": "joe@corp.example.edu",
         "first name": "Joe",
         "last name": "User",
         "active_tenant.id": "6e7563e8-e167-4bd6-b431-f4cfd82cb12e",
         "active_tenant.type": "maganets.CUSTOMER",
         "updated_at": "2021-02-14T01:14:25.000Z",
         "created_at": "2020-12-22T16:08:51.000Z",
    }

Embora API Keys sejam simples de usar e não expirem, acessos com API Key têm
algumas restrições:

- Acessos a dados de produção podem ser feitos apenas pela perspectiva do
  Consumidor associado ao usuário dono da API Key (ou seja, não é possível usar
  API Keys para acessar dados de produção pela perspectiva de Vendedor)

- Acessos a dados "rascunho" (às vezes chamado de sandbox), utilizado para
  testes, podem ser feitos com API Keys assumindo qualquer perspectiva.

Para acesso completo ao ambiente de produção API Magalu, você deve utilizar o
fluxo de autorização padrão OAuth 2.0. Chamadas OAuth 2.0 usam um token de
acesso no cabeçalho Authorization, como abaixo:

    $ curl -H "Authorization: Bearer AT" https://api.magalu.com/account/v1/whoami
    [...]

# Consultando pedidos e pacotes

Com sua API Key em mãos, você pode já consultar a API e descobrir quais
foram as últimas compras que você fez no Magalu e no Netshoes:

  $ curl -H "X-API-Key: MYAPIKEY" https://api.magalu.com/maestro/v1/orders | \
      jq ".[] | {uuid, id, created_at, channel: .sales_channel.organization.id}"
  [
      {
        "uuid": "2c14b2ad-4a7f-4e6c-a0a0-90d89e9cc34a",
        "id": "8954600874660585",
        "created_at": "2021-02-14T01:14:25.000Z",
        "channel": "magazine_luiza"
      },
      {
        "uuid": "fc4d3912-9ec6-4e55-8855-207385a37fd9",
        "id": "8954600882145512",
        "created_at": "2020-12-22T16:08:51.000Z",
        "channel": "netshoes"
      }
  ]

Se a consulta não retornou nenhum elemento, tem uma forma fácil de resolver:
faça uma compra no Magalu ou no Netshoes e faça novamente a chamada. :-)

A entidade que registra uma compra e seus produtos, Order, possui um ou
mais pacotes, representando a forma como a compra é dividida conforme o local e
o Vendedor (o dono do estoque) do produto:

    $ curl -H "X-API-Key: MYAPIKEY" \
      https://api.magalu.com/maestro/v1/orders/13bdb3e3-8fad-4f9b-a6c3-2fa99786289f
    [
        {
            "uuid": "6779584e-6d49-4489-9652-97d7f68799f5",
            "id": "8954650874610585",
            "sales_channel": {
                "id": 04,
                "description": "ML-APP Android",
                "organization": {
                    "uuid": "4da25f48-4193-45de-b4ed-9b8c93b7f987",
                    "id": "magazine_luiza",
                    "description": "Magazine Luiza"
                }
            },
            "customer": {
                "uuid": "5b02cdaf-9a93-4cfe-959a-ec989bd414e5",
                "name": "Joe User",
            },
            "payment":{
                "status": {
                   "id": "paid"
                },
            },
            "created_at": "2020-12-22T16:08:51.000Z",
            "updated_at": "2020-12-22T16:08:51.000Z",
            "packages":[
                {
                    "uuid": "a6dce737-fe37-4444-8c51-a021d10051b7",
                    "seller": {
                        "id": "seller-abcd",
                        "description": "Seller ABCD"
                    },
                    "amount": 151.01,
                    "created_at": "2020-12-22T16:08:51.000Z",
                    "updated_at": "2020-12-24T14:52:44.000Z"
                },
                {
                    "uuid": "72653741-4b3a-4327-9f13-03e4ffd2cb31",
                    "seller": {
                        "id": "magazineluiza",
                        "description": "Magazine Luiza"
                    },
                    "amount": 505.45,
                    "created_at": "2020-12-22T16:08:51.000Z",
                    "updated_at": "2020-12-24T14:52:44.000Z"
                }
            ]
        }
    ]

Para ver os itens de um pacote, consulte o endpoint /packages passando o UUID
relevante:

    $ curl -H "X-API-Key: MYAPIKEY" \
      https://api.magalu.com/maestro/v1/orders/13bdb3e3-8fad-4f9b-a6c3-2fa99786289f/packages/72653741-4b3a-4327-9f13-03e4ffd2cb31

    {
        "uuid": "72653741-4b3a-4327-9f13-03e4ffd2cb31",
        "seller": {
            "id": "magazineluiza",
            "description": "Magazine Luiza"
        },
        "amount": 505.45,
        "items":[
            {
                "uuid": "a7697479-4896-4a05-b439-f4ff9913f03b",
                "product": {
                    "id": "225339000",
                    "seller": {
                        "sku": "225339000"
                    },
                    "price": 240.13,
                    "freight": 22.50,
                    "discount": 55.60,
                    "interest": 10,
                    "value": 194.53,
                    "total": 217.03,
                    "description": "KIT 4 Cerveja Heineken Premium Puro Malte Lager",
                    "reference": "12 Unidades 350ml",
                    "brand": "Heineken",
                    "category": {
                        "id": "ME",
                        "subCategory": {
                            "id": "CVEJ"
                        }
                    },
                    "imageUrl": "https://a-static.mlcdn.com.br/{w}x{h}/cerveja-heineken-premium-puro-malte-lager-12-unidades-350ml/magazineluiza/225339000/b04fa5652e7755a44c0117e2124c6e1f.jpg"
                },
                "quantity": 2,
                "value": 389.06,
                "total": 434.07,
                "created_at": "2020-12-22T16:08:51.000Z",
                "updated_at": "2020-12-22T16:08:54.000Z",
                "gifts": [
                    {
                        "uuid": "acd27d3b-9d33-453b-abe9-48e76078a73e",
                        "id": "218743100",
                        "description": "Copo Cerveja",
                        "reference": "vidro",
                        "brand": "Plastic",
                        "quantity": 2,
                        "created_at": "2018-06-08T18:21:35.000Z",
                        "updated_at": "2018-06-08T18:21:35.000Z"
                    }
                ],
                "bundles": [
                    {
                        "uuid": "2bace316-9b49-46d1-a87a-34cc0b12610e",
                        "id": "218743100",
                        "description": "Cerveja Heineken Premiu",
                       "quantity": 4,
                        "price": 60.03,
                        "discount": 13.90,
                        "freight": 5.62,
                        "interest": 2.5,
                        "value": 48.63,
                        "total": 54.25,
                        "created_at": "2018-06-08T18:21:35.000Z",
                        "updated_at": "2018-06-08T18:21:35.000Z"
                    }
                ],
                "services": [
                    {
                        "uuid": "b34d71ec-b432-4b4c-83ff-c7c5297f179c",
                        "id": "3",
                        "description": "Garantia Extendida",
                        "price": 35.69,
                        "quantity": 2,
                        "total": 71.38,
                        "validity": {
                            "type": "month",
                            "value": 12
                        },
                        "slug": "GE",
                        "created_at": "2018-06-08T18:21:35.000Z",
                        "updated_at": "2018-06-08T18:21:35.000Z"
                    }
                ],
                "benefits": [
                      {
                          "type": "cashback",
                          "description": "10% em Cashback",
                          "amount": 19.99
                      }
                ]
            }
        ],
        "created_at": "2020-12-22T16:08:51.000Z",
        "updated_at": "2020-12-24T14:52:44.000Z"
    }

# Tenants e Perspectivas

Até aqui as requisições foram feitas assumindo que o usuário dono da API
Key está assumindo a perspectiva de um consumidor.

Um usuário da API pode representar diversas organizações ou grupos
diferentes (que na API, chamamos de "Tenants"), e pode também acessar a
API assumindo a perspectiva de Consumidor ou de Vendedor (o "Tenant
Type"). Tenants podem ter um apelido ("nickname") e um identificador
único.

Para visualizar quais tenants você tem acesso:

    $ curl -H "X-API-Key: MYAPIKEY" https://api.magalu.com/account/v1/whoami/tenants
    [
        {
            "uuid": "c2715319-e56d-4594-8299-6b2c9ba6d51a",
            "type": "maganets.CUSTOMER",
            "created_at": "2020-12-22T16:08:51.000Z",
            "updated_at": "2020-12-24T14:52:44.000Z"
        },
        {
            "uuid": "0c5d9da2-0efb-4a03-956a-344006817630",
            "type": "maganets.CUSTOMER"
            "created_at": "2020-12-22T16:08:51.000Z",
            "updated_at": "2020-12-24T14:52:44.000Z"
        },
        {
            "uuid": "50407c1c-0f43-49e9-9649-717ce2c53fd6",
            "type": "maganets.SELLER"
            "created_at": "2020-12-22T16:08:51.000Z",
            "updated_at": "2020-12-24T14:52:44.000Z"
        },
        {
            "uuid": "d2e23e35-763a-442a-938b-6544084a630b",
            "type": "stenagam.SELLER",
            "created_at": "2020-12-22T16:08:51.000Z",
            "updated_at": "2020-12-24T14:52:44.000Z"
        }
    ]

Utilizando o tenant certo, você está pronto para explorar outras partes da API.

# Testando com dados de "rascunho": o universo "stenagam"

Se você não trabalha para um Vendedor habilitado na plataforma Magalu (o
que talvez seja o caso para boa parte dos desenvolvedores do Brasil :-),
existe um tenant especial com o type stenagam.SELLER que permite explorar
dados da perspectiva de seller. Pense em "stenagam" como um universo paralelo,
onde todas as transações e dados gravados não gerem consequências concretas
(como pagamentos e entregas de mercadoria) no mundo real.

Dados armazenados para este tenant são fictícios e podem ser alterados sem
impacto no negócio. Utilize este tenant quando quiser revisar o modelo de dados
por esta perspectiva, antes de testar mudanças com dados de produção.

# Contribua para a API Magalu

Ah, faltou falar uma coisa :-) O processo de desenvolvimento da API Magalu é
aberto, e convidamos todos os desenvolvedores interessados a participar do
nosso Slack — basta se registrar em `https://dev.magalu.com/teaser-form` que
entramos em contato com um convite.

Caso tenham alguma problema ou sugestão durante o uso do portal ou das APIs,
podem abrir um bug) em `https://github.com/luizalabs/dev.magalu.com/issues`. E
podem usar feedback@dev.magalu.com para enviar seus comentários e pedidos
especiais.

Obrigado! Esperamos que tenha ficado tudo claro o suficiente para você começar
a explorar a funcionalidade da API, lembrando que o ponto de partida é o portal
em `https://dev.magalu.com/` -- nos vemos lá!

# Changelog

- 2021-07-08: v3, primeira versão pública
    - Introdução ao /account e /maestro, GET-only
    - Incorpora API Keys, tenants e introduz dicotomia maganets/stenagam

