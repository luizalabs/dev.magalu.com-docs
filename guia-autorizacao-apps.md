# Guia de autorização de aplicações

## Introdução

Este é o guia do provedor de identidade da Plataforma Magalu. É por ele que os usuários finais farão a autorização de aplicações para o uso de suas contas e se autenticarão nos sistemas Magalu.
Seguiu-se a [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749), que descreve o fluxo de OAuth 2.0, e a [especificação do OpenID](https://openid.net/specs/openid-connect-core-1_0.html), que descreve o fluxo de OpenID Connect, e dessa forma boa parte dos fluxos aqui apresentados já são bastante conhecidos pela comunidade.

É válido ressaltar que, para que o fluxo aqui presente possa ser exercido, é necessário que uma aplicação tenha sido criada no [DevPortal](https://alpha.dev.magalu.com/), o portal para desenvolvedores. No portal, você pode fazer a criação e configuração de uma aplicação, especificando os parâmetros que serão utilizados neste guia e tendo acesso aos valores de identificador e chave de aplicação (`client_id` e `secret`).

## Glossário

- **IDP**: provedor de identidade (Identity Provider), responsável por autenticar o usuário e fornecer um token de autenticação ao fornecedor de serviços.
- **Access Token**: token de acesso, é o resultado do fluxo de OAuth2/OpenID e é o que deve ser utilizado para consumir a API.

## API Keys vs OAuth2/OpenID

As API Keys foram criadas, dentro da plataforma Magalu, com o objetivo de facilitar um primeiro contato do usuário desenvolvedor com a API Magalu, e por questões de segurança existem algumas restrições associadas a elas, para que não sejam utilizadas em ambiente de produção. O OpenID (superconjunto do OAuth2), em sua essência, é um protocolo/padrão aberto de autorização que permite que um terceiro se autentique (login) e identifique em uma aplicação, para que a mesma possa agir em nome do respectivo terceiro, e é o seu fluxo que deve ser utilizado nas aplicações finais, em ambiente de produção.

## [Base URLs](#base-url)

| Ambiente | Base URL                    |
| -------- | --------------------------- |
| Produção | https://id.magalu.com/oauth |

### Endpoints

| Endpoint                     | URL                                    |
| ---------------------------- | -------------------------------------- |
| Autorização                  | https://id.magalu.com/oauth/auth       |
| Resgate de tokens            | https://id.magalu.com/oauth/token      |
| Introspect de tokens         | https://id.magalu.com/oauth/introspect |
| Resgate de dados do usuário  | https://id.magalu.com/oauth/userinfo   |
| Logout de usuário            | https://id.magalu.com/oauth/logout     |
| Certificados para validações | https://id.magalu.com/oauth/certs      |

![](./static/images/application_flow_by_user.png)

Mais informações sobre os endpoints citados podem ser consultadas na especificação (OpenAPI) do provedor de identidade, que estará disponível em breve.

## Entendendo o fluxo

O fluxo de autorização utilizando OAuth2 é mais simples do que parece, em resumo:

1. O usuário, consumidor da aplicação, é levado para a URL de autenticação do IDP, com um parâmetro que identifica a aplicação (`client_id`) que ele quer autorizar;
2. O usuário faz o `login` no IDP;
3. O usuário é redirecionado para uma das `redirect_uris` cadastradas na criação da aplicação (pode ser específica como parâmetro junto ao `client_id`), junto com um código de autorização;
4. A aplicação faz a troca do código de autorização por um Access Token do usuário, que será utilizado pela aplicação para fazer as chamadas em nome do mesmo.

## Autorizando uma aplicação

O desenvolvedor de uma aplicação, deve realizar o fluxo da seguinte forma:

### Passo 1

Esse passo consiste na [seção 4.1.1 da RFC do OAuth2](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1).

Quando o usuário, consumidor da aplicação, precisar autorizar a aplicação na Plataforma Magalu, é necessário fazer um redirecionamento (utilizando o método `GET`) do usuário para a URL de autorização (descrita em "[Base URLs](#base-url)") com os seguintes parâmetros:

- `response_type`: "code"
  - Esse parâmetro é obrigatório e o único valor aceito para ele é o da string "code".
  - Exemplo: `response_type=code`
- `client_id`: valor do client id da aplicação, criada no DevPortal.
  - Exemplo: `client_id=minha-aplicacao-para-sellers`
- `redirect_uri`: uma das `redirectUris` cadastradas no momento da criação da aplicação.
  - Indica a URI para qual o usuário será enviado com o código a ser trocado pelo Access Token. Aqui, deve ser colocada a URI de `callback` da sua aplicação.
  - Exemplo: `redirect_uri=https://minha-redirect-uri.dev`
- `scope`: são os scopes os quais a sua aplicação precisa ter acesso na conta do usuário.
  - No momento atual, é necessário passar somente o valor `openid`. Com ele, além dos scopes padrão, é possível utilizar o token gerado para consumo de toda a API disponibilizada. Entretanto, isso pode ser alterado conforme novas APIs forem sendo disponibilizadas.
  - Exemplo: `scope=openid`
- `state`: é um parâmetro de segurança, que deve ser gerado aleatoriamente pela aplicação.
  - Exemplo: `state=xyz`
  - Esse parâmetro é opcional, porém é citado como recomendado na especificação do OAuth2.
  - Mais informações podem ser consultadas na [seção 10.12 da RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749#section-10.12).

Dessa forma, um exemplo válido de URL para a qual o usuário deve ser redirecionado para autorizar a aplicação seria:

```
https://id.magalu.com/oauth/auth?response_type=code
	&client_id=minha-aplicacao
	&redirect_uri=https://minha-redirect-uri.dev
	&scope=openid
	&state=xyz
```

Onde:

- `response_type`=`code`
- `client_id`=`minha-aplicacao`
- `redirect_uri`=`https://minha-redirect-uri.dev`
- `state`=`xyz`
- `scope`=`openid`

### Passo 2

Após o usuário ser redirecionado para a URL de autenticação, ele cairá em uma tela de login, que permitirá que ele faça login como **vendedor** ou **consumidor**. É esperado que o usuário, nesse momento, preencha os seus dados e faça o login, e então inicia-se o passo 3.

> P.S.: Caso o usuário já tenha autorizado a aplicação e esses dados ainda estejam guardados no navegador, esse passo é pulado e o passo 3 inicia-se logo após o redirecionamento do passo 1.

### Passo 3

O usuário, após o login ou caso já esteja logado, será redirecionado para a `redirect_uri` em questão. Como citado anteriormente, ela será a passada como parâmetro para **https://id.magalu.com/oauth/auth**, e deve ter sido cadastrada anteriormente (no DevPortal). Seguindo os parâmetro do exemplo do passo 1, o usuário seria redirecionado para:

```
https://minha-redirect-uri.dev?state=fj8o3n7bdy1op5
	&session_state=94c44902-0d37-41b2-b6f1-45808ce8eb2f
	&code=6ccdb1f7-eb3d-49f0-894e-90b64dd6ead0.94c44902-0d37-41b2-b6f1-45808ce8eb2f.1e39527d-02aa-4fa0-97c9-fe6ce98fb93e
```

Dessa forma, a aplicação deve receber os parâmetros presentes na URL de redirecionamento e utilizá-los para completar o fluxo.

Dados os parâmetros, o `state` pode ser utilizado para implementação de proteção contra ataque de CSRF, conforme referenciado anteriormente, e o `session_state` é um identificador interno para identificar a sessão do usuário, que pode ser ignorado por hora. Por fim, o valor de `code` pode ser utilizado para resgatar um Access Token válido do usuário consumidor da aplicação, conforme descrito no passo 4.

### Passo 4

Com o valor de `code` em mãos, recebido no passo 3, é possível fazer uma requisição no IDP e obter um Access Token (JWT) do usuário que autorizou a aplicação. A requisição pode ser feita da seguinte forma:

```curl
curl -X POST "https://id.magalu.com/oauth/token" \
	--data-urlencode "grant_type=authorization_code" \
	--data-urlencode "client_id=$CLIENT_ID" \
	--data-urlencode "client_secret=$CLIENT_SECRET" \
	--data-urlencode "code=$CODE" \
	--data-urlencode "scope=$SCOPE" \
	--data-urlencode "redirect_uri=$REDIRECT_URI"
```

Onde:

- `$CLIENT_ID` deve ser o **client ID** da sua aplicação;
  - No exemplo, seria `minha-aplicacao`.
- `$CLIENT_SECRET` deve ser a **secret** da sua aplicação;
  - Ela pode ser consultada no DevPortal, e é um valor secreto que não deve ser compartilhado em hipótese alguma.
- `$CODE` deve ser o valor recebido no parâmetro `code` após o redirecionamento para a sua `redirect_uri` no passo 3;
  - No exemplo seria `6ccdb1f7-eb3d-49f0-894e-90b64dd6ead0.94c44902-0d37-41b2-b6f1-45808ce8eb2f.1e39527d-02aa-4fa0-97c9-fe6ce98fb93e`.
- `$SCOPE` deve possuir o valor `openid`;
- `$REDIRECT_URI` deve ser o valor da URI de redirecionamento utilizada no fluxo, e passada anteriormente para **https://id.magalu.com/oauth/auth**.

### Tokens obtidos

Após a requisição de troca de `code` por Access Token, é esperada uma resposta do seguinte formato:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhT2ZGNERFOG1PcnFyQjJYeTA3U1dOZzEyTHVfc3BKRThWQnFDb0tGR0VZIn0.eyJleHAiOjE2Mjc1ODc2NDAsImlhdCI6MTYyNzU4NDA0MCwiYXV0aF90aW1lIjoxNjI3NTg0MDI3LCJqdGkiOiJhMzQwYzE4YS05ZTExLTQwMjAtYjc1Yi1hNTU4ZmUwNDg0OGYiLCJpc3MiOiJodHRwczovL2lkLm1hZ2FsdS5jb20vYXV0aC9yZWFsbXMvbWFzdGVyIiwic3ViIjoiNjQ4ZTg5ZTMtM2JlNC00OGE3LTg2YzAtYzhlZWQ1YzQyMDc4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibWluaGEtYXBsaWNhY2FvIiwic2Vzc2lvbl9zdGF0ZSI6IjNjM2RkNTIyLTJmOTctNGE3YS04ZDY5LWMyOWE5M2M1Y2YzZCIsImFjciI6IjEiLCJzY29wZSI6Im9wZW5pZCBzcGktdGVuYW50cyBlbWFpbCIsInRlbmFudHMiOlt7InV1aWQiOiIwMDAwNTVkNS1jYThjLTRjZDUtYmMzOC1jYTVmYTBmOGUyM2EiLCJ0eXBlIjoic3RlbmFnYW0uQ1VTVE9NRVIiLCJpbnRlcm5hbF9pZCI6IjAwMDA1NWQ1LWNhOGMtNGNkNS1iYzM4LWNhNWZhMGY4ZTIzYSJ9LHsidXVpZCI6IjIxZmVhNzNjLWUyNDQtNDk3YS04NTQwLWJlMGQzYzU4MzU5NiIsInR5cGUiOiJzdGVuYWdhbS5TRUxMRVIiLCJpbnRlcm5hbF9pZCI6InN0ZW5hZ2FtX3NhbmRib3gifSx7InV1aWQiOiIyOGNkNzRiNC05YzE0LTRmMjAtYjZlZC1mMjViYTQ0Njc0OGEiLCJ0eXBlIjoibWFnYW5ldHMuQ1VTVE9NRVIiLCJpbnRlcm5hbF9pZCI6IjI4Y2Q3NGI0LTljMTQtNGYyMC1iNmVkLWYyNWJhNDQ2NzQ4YSJ9XSwiYXVkIjoicHVibGljIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJvcmciOiJtYWdhbHUiLCJlbWFpbCI6ImFsY2lkZXNtaWdAZ21haWwuY29tIn0.c-wbcSPkL04j62RH6oFeovV1mJ-t2qZsQ55G_Hxqp3jeUE5RCWUglIBWS0Bdu0O2Vg80cz98jCoM32ptdLZXwZJadGIv41ZCqUtVxnqAve5kOqyjvUQDH95rzBMDGWQNPxgPmpaAJOStKqSLBX7Blt-Dsgm_7tXibKwdzZ9ADV3NiH9cngpJy_8wLWMahhuF5EUsxC9alj0qn5Uj8XoxGVssSYG8yJ72mqf7LMhtqp12pCZFQ8fKsmayxLEOrlfKsWlOq5W7XM9xVSfGbMOGSvPtGt1iWlHCwoPyI6bmSGYIFjDoJozZ5nRjlIs6aFK9-tDBwO9jSv9rtJhfc8mt7Q",
  "expires_in": 3600,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0ZTBmYWI0Ny01YjFiLTRmNjUtOTRkMS1iMGNmODE2MDQ3ZmEifQ.eyJleHAiOjE2Mjc1ODU4NDAsImlhdCI6MTYyNzU4NDA0MCwianRpIjoiNjk0MTkyMzctNGE3ZC00ZWI3LWEwY2ItMTNiYTFlNzdhNTliIiwiaXNzIjoiaHR0cHM6Ly9pZC5tYWdhbHUuY29tL2F1dGgvcmVhbG1zL21hc3RlciIsImF1ZCI6Imh0dHBzOi8vaWQubWFnYWx1LmNvbS9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJzdWIiOiI2NDhlODllMy0zYmU0LTQ4YTctODZjMC1jOGVlZDVjNDIwNzgiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoibWluaGEtYXBsaWNhY2FvIiwic2Vzc2lvbl9zdGF0ZSI6IjNjM2RkNTIyLTJmOTctNGE3YS04ZDY5LWMyOWE5M2M1Y2YzZCIsInNjb3BlIjoib3BlbmlkIHNwaS10ZW5hbnRzIGVtYWlsIn0.QIaBCGVBiUX-m7ZbMjjD191-KllzfYnrLsbgkVueBVA",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhT2ZGNERFOG1PcnFyQjJYeTA3U1dOZzEyTHVfc3BKRThWQnFDb0tGR0VZIn0.eyJleHAiOjE2Mjc1ODc2NDAsImlhdCI6MTYyNzU4NDA0MCwiYXV0aF90aW1lIjoxNjI3NTg0MDI3LCJqdGkiOiJkNDIwY2ZlNy04N2UwLTQyY2ItODQ3NC0zMjNjNTFhZTBlY2IiLCJpc3MiOiJodHRwczovL2lkLm1hZ2FsdS5jb20vYXV0aC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoibWluaGEtYXBsaWNhY2FvIiwic3ViIjoiNjQ4ZTg5ZTMtM2JlNC00OGE3LTg2YzAtYzhlZWQ1YzQyMDc4IiwidHlwIjoiSUQiLCJhenAiOiJtaW5oYS1hcGxpY2FjYW8iLCJzZXNzaW9uX3N0YXRlIjoiM2MzZGQ1MjItMmY5Ny00YTdhLThkNjktYzI5YTkzYzVjZjNkIiwiYXRfaGFzaCI6Ii1VMTF4alljc2RKSl9ZdXJMOU9wemciLCJhY3IiOiIxIiwidGVuYW50cyI6W3sidXVpZCI6IjAwMDA1NWQ1LWNhOGMtNGNkNS1iYzM4LWNhNWZhMGY4ZTIzYSIsInR5cGUiOiJzdGVuYWdhbS5DVVNUT01FUiIsImludGVybmFsX2lkIjoiMDAwMDU1ZDUtY2E4Yy00Y2Q1LWJjMzgtY2E1ZmEwZjhlMjNhIn0seyJ1dWlkIjoiMjFmZWE3M2MtZTI0NC00OTdhLTg1NDAtYmUwZDNjNTgzNTk2IiwidHlwZSI6InN0ZW5hZ2FtLlNFTExFUiIsImludGVybmFsX2lkIjoic3RlbmFnYW1fc2FuZGJveCJ9LHsidXVpZCI6IjI4Y2Q3NGI0LTljMTQtNGYyMC1iNmVkLWYyNWJhNDQ2NzQ4YSIsInR5cGUiOiJtYWdhbmV0cy5DVVNUT01FUiIsImludGVybmFsX2lkIjoiMjhjZDc0YjQtOWMxNC00ZjIwLWI2ZWQtZjI1YmE0NDY3NDhhIn1dLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm9yZyI6Im1hZ2FsdSIsImVtYWlsIjoiYWxjaWRlc21pZ0BnbWFpbC5jb20ifQ.bQUi-dNbEZMPWlN0PTrnG8bOPRKvWbhOMnbxC8Cy1PdhVbsXphKqZkQGST4FgnYifNBzHyGWG44V--1EY-wxuJwILGArm4Em758HwYeB2CIdYhb7YIyy_WTJk-1H7A8DLK3sxaW3iubKf0VgRgsZGJGLNVdHKLUXdnvpUH7s_mWnOdoachutqe6nIdvTex_EW3DCux9_2ZCqROdO8bqmVQwBVSoOrwMcfNm9EdfgI5qhqlBWFaBl8xJoQQr-bivFchNfT29oNRMaBqihyicgpK3TSNwqwJzHxdmfF30KKQzThWgPp39Vlws98bvJFq82-TWUhmZmrO5Gkb6zeP2XFA",
  "not-before-policy": 1627480351,
  "session_state": "3c3dd522-2f97-4a7a-8d69-c29a93c5cf3d",
  "scope": "openid spi-tenants email"
}
```

Onde o `access_token` é o Access Token a ser utilizado pela aplicação, e pode ser de dois formatos, e `scope` tem os valores `default` do nosso provedor de identidade, somados aos pedidos pela aplicação.

> Observação: os valores `default` de `scope` são, até o momento, `spi-tenants`, `seller_access` e `email`.

Estamos trabalhando no desenvolvimento de novos scopes, mas até o momento os pré-configurados como padrão, juntos ao `openid`, são suficientes para que qualquer parte da API seja utilizada.

Dessa forma, então o Access Token quando aberto conterá um payload com o seguinte formato:

```json
{
  "exp": 1627587640,
  "iat": 1627584040,
  "auth_time": 1627584027,
  "jti": "a340c18a-9e11-4020-b75b-a558fe04848f",
  "iss": "https://id.magalu.com/auth/realms/master",
  "sub": "648e89e3-3be4-48a7-86c0-c8eed5c42078",
  "typ": "Bearer",
  "azp": "minha-aplicacao",
  "session_state": "3c3dd522-2f97-4a7a-8d69-c29a93c5cf3d",
  "acr": "1",
  "scope": "openid spi-tenants email",
  "tenants": [
    {
      "uuid": "000055d5-ca8c-4cd5-bc38-ca5fa0f8e23a",
      "type": "stenagam.CUSTOMER",
      "internal_id": "000055d5-ca8c-4cd5-bc38-ca5fa0f8e23a"
    },
    {
      "uuid": "21fea73c-e244-497a-8540-be0d3c583596",
      "type": "stenagam.SELLER",
      "internal_id": "stenagam_sandbox"
    },
    {
      "uuid": "28cd74b4-9c14-4f20-b6ed-f25ba446748a",
      "type": "maganets.CUSTOMER",
      "internal_id": "28cd74b4-9c14-4f20-b6ed-f25ba446748a"
    }
  ],
  "aud": "public",
  "email_verified": false,
  "org": "magalu",
  "email": "fulano-de-tal@luizalabs.com"
}
```

Ainda assim, caso a conta esteja vinculada a um seller, existirá mais um atributo `seller` no payload, que é de uso interno da plataforma. Tendo esse Access Token em mãos, a aplicação pode consultar os tenants do usuário no `Account` e então fazer as requisições na nossa API. :-)

### Renovação de Access Token

É válido ressaltar, ainda, que o Refresh Token pode ser utilizado para renovar o Access Token do usuário na mesma sessão, e isso pode ser feito através da seguinte requisição:

```curl
curl -X POST "https://id.magalu.com/oauth/token" \
	--data-urlencode "grant_type=refresh_token" \
	--data-urlencode "client_id=$CLIENT_ID" \
	--data-urlencode "client_secret=$CLIENT_SECRET" \
	--data-urlencode "refresh_token=$REFRESH_TOKEN"
```

Onde:

- `$CLIENT_ID` deve ser o **client ID** da sua aplicação;
- `$CLIENT_SECRET` deve ser a **secret** da sua aplicação;
- `$REFRESH_TOKEN` deve ser o **Refresh Token** obtido no fluxo de obtenção de tokens.

Além disso, a resposta para essa requisição será a mesma da retornada na troca de um `code` por um Access Token.

### Validação de Access Tokens

Uma vez obtido um Access Token, você ainda pode validá-lo utilizando os certificados presentes em **https://id.magalu.com/oauth/certs**. Essa validação pode ser feita facilmente utilizando alguma biblioteca existente para a sua linguagem.

Em golang, por exemplo, isso pode ser feito utilizando a biblioteca [jwt-go](https://github.com/dgrijalva/jwt-go), com o seguinte trecho de código:

```go
import jwt "github.com/dgrijalva/jwt-go"
// ...
	jwks, err := keyfunc.Get("https://id.magalu.com/oauth/certs", keyfunc.Options{
		Client: &http.Client{
			Timeout: TIMEOUT_PARA_REQUEST_NO_IDP,
		},
	})
	if err != nil {
		// Erro resgatando os certificados em https://id.magalu.com/oauth/certs
	}
	token, err := jwt.Parse(ACCESS_TOKEN, jwks.KeyFunc)
	if err != nil {
		// Erro na validação do Token JWT
	}
// ...
```
