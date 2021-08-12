# Walkthrough API Marketplace Magalu

## Disclaimer

Atualmente a API do Marketplace da Magalu encontra-se em estado beta, com acesso restrito a alguns convidados que manifestaram interesse durante a chamada de interessados no TDC Connections, que ocorreu em Junho deste ano. A abertura da API publicamente acontecerá ainda este ano, e será amplamente divulgada.

Para este momento, considere que as URLs referenciadas no texto possuem, atualmente, um prefixo alpha. Dessa forma, https://dev.magalu.com/ referencia https://alpha.dev.magalu.com/ e https://api.magalu.com/ referencia https://alpha.api.magalu.com/.


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

Todos os recursos da API são expostos pelo domínio api.magalu.com. A
documentação e ferramentas para desenvolvedores, inclusive gerenciamento de
tokens de acesso, residem em https://dev.magalu.com/ -- para se cadastrar basta
ter uma conta Github. Esperamos você lá!

# Autenticação e Autorização

A forma mais simples de acessar a API Magalu é usando um API Key,
que pode ser gerada em https://dev.magalu.com/user. Neste documento, onde
aparecer `MYAPIKEY` deve ser feita a substituição pela chave gerada.

> Observação: este documento contém exemplos que assumem que você tenha as
> ferramentas de linha de comando `curl` e `jq` instaladas, que em Linux estão
> disponíveis como pacotes do sistema, e em outros sistemas operacionais, em
> repositórios públicos.

Para testar se sua API Key está funcionando, use o seguinte endpoint:

```bash
$ curl -H "X-API-Key: MYAPIKEY" https://api.magalu.com/account/v1/whoami
{
        "uuid": "5b02cdaf-9a93-4cfe-959a-ec989bd414e5",
        "preferred_email": "joe@corp.example.edu",
        "first name": "Joe",
        "last name": "User",
        "active_tenant": {
            "uuid": "6e7563e8-e167-4bd6-b431-f4cfd82cb12e",
            "type": "maganets.CUSTOMER"
        },
        "updated_at": "2021-02-14T01:14:25.000Z",
        "created_at": "2020-12-22T16:08:51.000Z",
}
```

Embora API Keys sejam simples de usar e não expirem, acessos com API Key têm
algumas restrições:

- Acessos a dados de produção podem ser feitos apenas pela perspectiva do
  Consumidor associado ao usuário dono da API Key (ou seja, não é possível usar
  API Keys para acessar dados de produção pela perspectiva de Vendedor)

- Acessos a dados "rascunho" (às vezes chamado de sandbox), utilizado para
  testes, podem ser feitos com API Keys assumindo qualquer perspectiva.

Para acesso completo ao ambiente de produção API Magalu, você deve utilizar o
fluxo de autorização padrão OAuth 2.0. Chamadas OAuth 2.0 usam um token de
acesso no cabeçalho Authorization, conforme indicado abaixo:

```bash
$ curl -H "Authorization: Bearer MYTOKEN" https://api.magalu.com/account/v1/whoami
[...]
```

# Consultando pedidos e pacotes

Com sua API Key em mãos, você pode já consultar a API e descobrir quais
foram as últimas compras que você fez no Magalu e no Netshoes:

```bash
$ curl -H "X-API-Key: MYAPIKEY" https://api.magalu.com/maestro/v1/orders | \
    jq ".[] | {uuid, number, created_at, channel: .sales_channel.organization.code}"
[
    {
        "uuid": "2d9abb9a-f55a-4954-ba0b-ffb7878610fd",
        "number": "8808500784192253",
        "created_at": "2020-10-23T03:56:50.000Z",
        "channel": "magazine_luiza"
    },
    {
        "uuid": "ff118cb5-7a32-427a-ac12-075a818c8974",
        "number": "8954600882145512",
        "created_at": "2020-12-22T16:08:51.000Z",
        "channel": "netshoes"
    }
]
```

Se a consulta não retornou nenhum elemento, tem uma forma fácil de resolver:
faça uma compra no Magalu ou no Netshoes e faça novamente a chamada. :-)

A entidade que registra uma compra e seus produtos, Order, possui um ou
mais pacotes, representando a forma como a compra é dividida conforme o local e
o Vendedor (o dono do estoque) do produto:

```bash
$ curl -H "X-API-Key: MYAPIKEY" \
    https://api.magalu.com/maestro/v1/orders/13bdb3e3-8fad-4f9b-a6c3-2fa99786289f
[
    {
        "uuid": "13bdb3e3-8fad-4f9b-a6c3-2fa99786289f",
        "number": "8954650874610585",
        "sales_channel": {
            "code": 04,
            "description": "ML-APP Android",
            "organization": {
                "uuid": "4da25f48-4193-45de-b4ed-9b8c93b7f987",
                "code": "magazine_luiza",
                "description": "Magazine Luiza"
            }
        },
        "customer": {
            "uuid": "5b02cdaf-9a93-4cfe-959a-ec989bd414e5",
            "name": "Joe User",
        },
        "payment":{
            "status": {
                "code": "paid"
            },
        },
        "packages":[
            {
                "uuid": "a6dce737-fe37-4444-8c51-a021d10051b7",
                "seller": {
                    "code": "seller-abcd",
                    "description": "Seller ABCD"
                },
                "amount": 151.01,
                "created_at": "2020-12-22T16:08:51.000Z",
                "updated_at": "2020-12-24T14:52:44.000Z"
            },
            {
                "uuid": "72653741-4b3a-4327-9f13-03e4ffd2cb31",
                "seller": {
                    "code": "magazineluiza",
                    "description": "Magazine Luiza"
                },
                "amount": 505.45,
                "created_at": "2020-12-22T16:08:51.000Z",
                "updated_at": "2020-12-24T14:52:44.000Z"
            }
        ],
        "created_at": "2020-12-22T16:08:51.000Z",
        "updated_at": "2020-12-22T16:08:51.000Z"
    }
]
```

Para ver os itens de um pacote, consulte o endpoint /packages passando o UUID
relevante:

```bash
$ curl -H "X-API-Key: MYAPIKEY" \
  https://api.magalu.com/maestro/v1/orders/13bdb3e3-8fad-4f9b-a6c3-2fa99786289f/packages/72653741-4b3a-4327-9f13-03e4ffd2cb31

{
    "uuid": "72653741-4b3a-4327-9f13-03e4ffd2cb31",
    "seller": {
        "code": "magazineluiza",
        "description": "Magazine Luiza"
    },
    "amount": 505.45,
    "items":[
        {
            "uuid": "a7697479-4896-4a05-b439-f4ff9913f03b",
            "product": {
                "code": "225339000",
                "seller": {
                    "sku": "225339000"
                },
                "price": 240.13,
                "freight": {
                    "cost": {
                        "customer": 4.99
                    }
                }
            },
            "discount": 55.60,
            "interest": 10,
            "value": 194.53,
            "total": 217.03,
            "description": "KIT 4 Cerveja Heineken Premium Puro Malte Lager",
            "reference": "12 Unidades 350ml",
            "brand": "Heineken",
            "category": {
                "id": "ME",
                "sub_category": {
                    "id": "CVEJ"
                }
            },
            "image_url": "https://a-static.mlcdn.com.br/{w}x{h}/cerveja-heineken-premium-puro-malte-lager-12-unidades-350ml/magazineluiza/225339000/b04fa5652e7755a44c0117e2124c6e1f.jpg"
            },
            "quantity": 2,
            "value": 389.06,
            "total": 434.07,
            "gifts": [
                {
                    "uuid": "acd27d3b-9d33-453b-abe9-48e76078a73e",
                    "product": {
                        "code": "218743100"
                        "description": "Copo Cerveja",
                        "reference": "vidro",
                        "brand": "Plastic"
                    },
                    "quantity": 2,
                    "created_at": "2018-06-08T18:21:35.000Z",
                    "updated_at": "2018-06-08T18:21:35.000Z"
                }
            ],
            "bundles": [
                {
                    "uuid": "2bace316-9b49-46d1-a87a-34cc0b12610e",
                    "product": {
                        "code": "218743100",
                        "price": 60.03,
                        "freight": {
                            "cost": {
                                "customer": 5.62
                            }
                        },
                        "description": "Cerveja Heineken Premium",
                        "discount": 13.90,
                        "interest": 2.5,
                        "value": 48.63,
                        "total": 54.25
                    },
                    "quantity": 4,
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
            ],
            "created_at": "2020-12-22T16:08:51.000Z",
            "updated_at": "2020-12-22T16:08:54.000Z"
        }
    ],
    "created_at": "2020-12-22T16:08:51.000Z",
    "updated_at": "2020-12-24T14:52:44.000Z"
}
```

# Consultando e cadastrando SKUs

Para utilizar a API de catálogo, Adelpha, é necessário utilizar um tenant de tipo `{maganets|stenagam}.SELLER`. Tendo um desses, podemos checar os SKUs ligados ao seller dado no endpoint /skus:

```bash
$ curl -H "X-API-Key: MYAPIKEY" -H "X-Tenant-ID: 21fea73c-e244-497a-8540-be0d3c583596" \
  https://api.magalu.com/adelpha/v1/skus?_limit=1 | jq ".[] | {sku, channels, identifier: .product.identifier}"
{
  "sku": "mySku0401",
  "channels": [
    {
      "active": false,
      "listing_id": null,
      "name": "magazineluiza",
      "price": {
        "currency": "BRL",
        "list_price": 90828251.32,
        "value": 90820401.32
      },
      "promotionals": [],
      "status": "OFFLINE",
      "url": null
    }
  ],
  "identifier": [
    {
      "type": "ean",
      "value": "1234567804019"
    },
    {
      "type": "isbn",
      "value": "1234567804026"
    },
    {
      "type": "ncm",
      "value": "0401.61.30"
    }
  ]
}
```

Como visto no exemplo acima, é possível paginar os resultados de /skus com os parâmetros `_limit` e `_offset`, e filtrá-los com qualquer um dos parâmetros `sku`, `title`, `ean`, `ncm`, `isbn`, `group_id`:
```bash
$ curl -H "X-API-Key: MYAPIKEY" -H "X-Tenant-ID: 21fea73c-e244-497a-8540-be0d3c583596" \
  https://api.magalu.com/adelpha/v1/skus?isbn=1234567804026 | jq
[
  {
    "channels": [
      {
        "active": false,
        "listing_id": null,
        "name": "magazineluiza",
        "price": {
          "currency": "BRL",
          "list_price": 90828251.32,
          "value": 90820401.32
        },
        "promotionals": [],
        "status": "OFFLINE",
        "url": null
      }
    ],
    "product": {
      "attributes": [
        {
          "type": "tsgtflqt0401",
          "value": "iahhqgia0401"
        },
        {
          "type": "pqkzngwp0401",
          "value": "xrjavqpw0401"
        }
      ],
      "brand": "wjNXwcMhlBFCPRlkrsib0401",
      "created_at": "2021-07-30T20:46:24.209000",
      "creator": "ff6c63f2-2379-43a1-aed3-870ba83c91b7",
      "datasheet": [
        {
          "type": "ruaiqnxi0401",
          "value": "mzbvtqbx0401"
        },
        {
          "type": "nurhfiib0401",
          "value": "urjwesrq0401"
        }
      ],
      "description": "...",
      "dimensions": {
        "depth": 34,
        "height": 808,
        "weight": 31,
        "width": 70
      },
      "group_id": "610187991d2bf3b979a67c40",
      "identifier": [
        {
          "type": "ean",
          "value": "1234567804019"
        },
        {
          "type": "isbn",
          "value": "1234567804026"
        },
        {
          "type": "ncm",
          "value": "0401.61.30"
        }
      ],
      "media": {
        "images": ["..."],
        "videos": ["..."]
      },
      "origin": "imported",
      "package": {
        "depth": 64,
        "height": 30,
        "weight": 61,
        "width": 80
      },
      "perishable": true,
      "tags": [
        "vixjxzyv0401",
        "hmugeipj0401"
      ],
      "tax_replacement": false,
      "title": "PnxwxKTJGv0401",
      "updated_at": "2021-07-30T20:48:09.006000",
      "updater": "ff6c63f2-2379-43a1-aed3-870ba83c91b7"
    },
    "sku": "mySku0401",
    "stocks": [
      {
        "branch": "zbxqyoqx0401",
        "delivery_time": 10401,
        "name": "daoyfowu0401",
        "quantity": 5404,
        "reserved": 14,
        "type": "on_supplier"
      }
    ]
  }
]
```

Para cadastrar um novo SKU, utilizamos também o endpoint /skus, onde é obrigatório informar:
- o código do sku;
- os dados do produto (título, outros "identifiers", descrição, peso do pacote, etc);
- os dados de estoque da oferta;
- os canais onde se deseja publicar a oferta e os preços por canal.

```bash
$ curl -X POST https://api.magalu.com/adelpha/v1/skus\
  -H "X-API-Key: MYAPIKEY" -H "X-Tenant-ID: 21fea73c-e244-497a-8540-be0d3c583596" \
  -H "accept: application/json" -H "content-type: application/json" \
  -d '{
    "sku": "012345678",
    "stocks": [{
    "quantity": 1234,
    "branch": "ULA01",
    "name": "Estoque X",
    "type": "on_seller",
    "reserved": 0,
    "delivery_time": 144000
  }],
  "channels": [{
    "name": "SuperApp",
    "active": true,
    "price": {
    "value": 1234.99,
    "list_price": 1300
    }
  }],
  "product": {
    "group_id": "5f6e2b8a9f91f47840b9bf49",
    "identifier": [
        {
        "type": "ean",
        "value": "841667100531"
        },
        {
        "type": "isbn",
        "value": "9788562063602"
        },
        {
        "type": "ncm",
        "value": "8517.61.30"
        }
    ],
    "title": "Tablet Wi-Fi 4GB Tela 6",
    "description": "Feito para os amantes da leitura com sua tela de 6 polegadas...",
    "origin": "national",
    "perishable": false,
    "package": {
        "height": 100,
        "width": 80,
        "depth": 90,
        "weight": 150
    },
    "datasheet": [
        {
        "type": "Voltagem",
        "value": "220"
        },
        {
        "type": "Cor",
        "value": "Branca"
        }
    ],
    "tags": [
        "my-tag-1",
        "my-tag-2"
    ],
    "brand": "Samsung",
    "media": {
        "images": [
        "https://mysite.domain/some-image.jpg"
        ],
        "videos": [
        "https://youtube/some-video/"
        ]
    },
    "dimensions": {
        "height": 100,
        "width": 80,
        "depth": 90,
        "weight": 150
    },
    "attributes": [
      {
        "type": "Portas USB",
        "value": "2"
      },
      {
        "type": "Wifi",
        "value": "Sim"
      }
    ]
  }
}'
```
Com o campo `channels.active` tendo o valor `true`, entende-se que o pedido criado pode ser listado como uma oferta ativa no canal indicado. Dessa forma, após passar por um período de avaliação de conteúdo, o produto aparecerá no(s) site(s) dos canais informados.

**Importante:** as requisições mostradas aqui usam API Key porque estão utilizando um tenant de tipo `stenagam.SELLER`, que contém dados de teste. Para utilizar a visão de dados do mundo real é necessário ter um token de acesso proveniente do fluxo de OAuth 2.0, que é melhor explicado no [Guia de autorização de aplicações](https://github.com/luizalabs/dev.magalu.com-docs/blob/main/guia-autorizacao-apps.md).

# Tenants e Perspectivas

Até aqui as requisições foram feitas assumindo que o usuário dono da API
Key está assumindo a perspectiva de um consumidor.

Um usuário da API pode representar diversas organizações ou grupos
diferentes (que na API, chamamos de "Tenants"), e pode também acessar a
API assumindo a perspectiva de Consumidor ou de Vendedor (o "Tenant
Type"). Tenants têm um tipo e um identificador únicos.

Para visualizar quais tenants você tem acesso:

```bash
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
        "uuid": "21fea73c-e244-497a-8540-be0d3c583596",
        "type": "stenagam.SELLER",
        "created_at": "2021-07-08T20:48:54.42094604Z",
        "updated_at": "2021-07-08T20:48:54.420946164Z"
    },
    {
        "uuid": "000055d5-ca8c-4cd5-bc38-ca5fa0f8e23a",
        "type": "stenagam.CUSTOMER",
        "created_at": "2021-07-08T20:48:54.420945556Z",
        "updated_at": "2021-07-08T20:48:54.420945893Z"
    }
]
```

Utilizando o tenant certo, você está pronto para explorar outras partes da API. Para alterar a perspectiva (o "tenant") utilizada nas requisições feitas na API, basta adicionar o header `"X-Tenant-ID: MYTENANTID"`, onde `MYTENANTID` é um dos uuids obtidos no passo anterior. Por exemplo:

```bash
$ curl -H "X-API-Key: MYAPIKEY" -H "X-Tenant-ID: 21fea73c-e244-497a-8540-be0d3c583596" https://api.magalu.com/maestro/v1/orders?_limit=1
[
  {
    "uuid": "efb77dcf-d83c-4935-81ac-7be5f37e6cdc",
    "number": "9014500879663847",
    "sales_channel": {
      "code": 53,
      "description": "ML-APP Android",
      "organization": {
        "uuid": "4da25f48-4193-45de-b4ed-9b8c93b7f987",
        "code": "magazine_luiza",
        "description": "Magazine Luiza"
      }
    },
    "customer": {
      "uuid": "001dc28a-fe4d-482c-a0ef-6c6cdc46f94a",
      "name": "Sofist Nome da Pessoa"
    },
    "payment": {
      "status": {
        "code": "processing"
      },
      "currency": "BRL"
    },
    "packages": [
      {
        "uuid": "e3ae3598-8034-4374-8eed-bdca8c31d5a0",
        "seller": {
          "code": "stenagam_sandbox",
          "description": "Stenagam Sandbox"
        },
        "amount": 198.99,
        "created_at": "2021-01-06T07:26:38.000Z",
        "updated_at": "2021-07-02T12:59:58.000Z"
      },
      {
        "uuid": "b90a950b-c95e-4b4c-be25-0eff5c764500",
        "seller": {
          "code": "stenagam_sandbox",
          "description": "Stenagam Sandbox"
        },
        "amount": 20.7,
        "created_at": "2021-01-06T07:26:38.000Z",
        "updated_at": "2021-07-02T12:59:58.000Z"
      }
    ],
    "created_at": "2021-01-06T07:26:38.000Z",
    "updated_at": "2021-01-06T07:54:30.000+0000"
  }
]
```

Vale ressaltar que os únicos tenants que não permitimos com o uso de API Keys são os com `type` = `maganets.SELLER` :-)

# Testando com dados de "rascunho": o universo "stenagam"

Se você não trabalha para um Vendedor habilitado na plataforma Magalu (o
que talvez seja o caso para boa parte dos desenvolvedores do Brasil :-),
existe um tenant especial com o type `stenagam.SELLER` que permite explorar
dados da perspectiva de seller. Pense em "stenagam" como um universo paralelo,
onde todas as transações e dados gravados não gerem consequências concretas
(como pagamentos e entregas de mercadoria) no mundo real.

Dados armazenados para este tenant são fictícios e podem ser alterados sem
impacto no negócio. Utilize este tenant quando quiser revisar o modelo de dados
por esta perspectiva, antes de testar mudanças com dados de produção.

# Contribua para a API Magalu

Ah, faltou falar uma coisa :-) O processo de desenvolvimento da API Magalu é
aberto, e convidamos todos os desenvolvedores interessados a participar do
nosso Slack — basta se registrar em https://dev.magalu.com/teaser-form que
entramos em contato com um convite.

Caso tenham alguma problema ou sugestão durante o uso do portal ou das APIs,
podem abrir um bug) em https://github.com/luizalabs/dev.magalu.com/issues. E
podem usar feedback@dev.magalu.com para enviar seus comentários e pedidos
especiais.

Obrigado! Esperamos que tenha ficado tudo claro o suficiente para você começar
a explorar a funcionalidade da API, lembrando que o ponto de partida é o portal
em https://dev.magalu.com/ -- nos vemos lá!

# Changelog
- 2021-08-09:
    - Adiciona /adelpha ao guia
- 2021-07-23: v4, alinhando o guia ao estado atual das APIs
    - Altera as rotas de /account e /maestro de acordo com o modelo de dados atual
    - Adiciona informações sobre tenants
- 2021-07-08: v3, primeira versão pública
    - Introdução ao /account e /maestro, GET-only
    - Incorpora API Keys, tenants e introduz dicotomia maganets/stenagam
