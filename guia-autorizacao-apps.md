# Guia de autorização de aplicações


## Introdução

XXXX é o provedor de identidade da Plataforma Magalu. É por ele que os usuários finais farão a autorização de aplicações para o uso de suas contas e se autenticarão nos nossos sistemas.
Seguimos a [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749), que descreve o fluxo de OAuth 2.0, e dessa forma boa parte dos fluxos aqui apresentados já são bastante conhecidos pela comunidade.


## Glossário

- IDP: é o provedor de identidade (Identity Provider).
- `Access Token`: token de acesso, é o resultado do fluxo de OAuth2 e é o que deve ser utilizado para consumir a API.

## API Keys vs OAuth2

As API Keys foram criadas, dentro da plataforma Magalu, com o objetivo de facilitar um primeiro contato do usuário desenvolvedor com a API Magalu, e por questões de segurança existem algumas restrições associadas a elas, para que não sejam utilizadas em ambiente de produção. O OAuth2, em sua essência, é um protocolo/padrão aberto de autorização que permite que um terceiro se autentique (logon) em uma aplicação, para que a aplicação possa agir em nome do respectivo terceiro, e é o seu fluxo que deve ser utilizado nas aplicações finais, em ambiente de produção.

## Base URLs
Pendentes

## Entendendo o fluxo

O fluxo de autorização utilizando OAuth2 é mais simples do que parece, em resumo:
1. O usuário, consumidor da aplicação, é levado para a URL de autenticação do nosso IDP, com um paramêtro que identifica a aplicação (`client_id`) a qual ele quer autorizar;
2. O usuário faz o `login` no nosso IDP;
3. O usuário é redirecionado para uma das `redirectUris` cadastradas na criação da aplicação (pode ser específica como parâmetro junto ao `client_id`), junto com um código de autorização;
4. A aplicação faz a troca do código de autorização por um `Access Token` do usuário, que será utilizado pela aplicação para fazer as chamadas em nome do mesmo.

## Autorizando uma aplicação

Você, como desenvolvedor de uma aplicação, deve realizar o fluxo da seguinte forma:

### Passo 1
Esse passo consiste na [seção 4.1.1 da RFC do OAuth2](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1).

Quando o usuário, consumidor da aplicação, precisar autorizar a aplicação na Plataforma Magalu, é necessário fazer um redirecionamento (utilizando o método `GET`) do usuário para a URL de autorização (descrita em "Base URLs") com os seguintes parâmetros:

- `response_type`: "code"
	- Esse parâmetro é obrigatório e o único valor aceito para ele é o da string "code".
-  `client_id`: valor do client id da aplicação, criada no DevPortal
	- Exemplo: "minha-aplicacao-para-sellers"
- `redirect_uri`: uma das `redirectUris` cadastradas no momento da criação da aplicação
	- Indica a URI para qual o usuário será enviado com o código a ser trocado pelo `Access Token`. Aqui, deve ser colocada a URI de `callback` da sua aplicação. Caso somente um valor tenha sido cadastrado, esse parâmetro pode ser omitido e a URI cadastrada será utilizada como padrão.
- `scope`: são os scopes os quais a sua aplicação precisa ter acesso na conta do usuário. 
	- No momento atual, os `scopes` padrão já são suficientes para consumo de toda a API disponibilizada, e portanto esse parâmetro pode ser omitido. Entretanto, isso pode ser alterado conforme novas APIs forem sendo disponibilizadas
- `state`: é um parâmetro de segurança, que deve ser gerado aleatoriamente pela aplicação.
	- Esse parâmetro é opcional, porém é citado como recomendado na especificação do OAuth2.
	- Mais informações podem ser consultadas na [seção 10.12 da RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749#section-10.12).

Dessa forma, um exemplo válido de URL para a qual o usuário deve ser redirecionado para autorizar a aplicação seria:

```
${BASE_URL_AUTH}?response_type=code
	&client_id=minha-aplicacao
	&redirect_uri=https://minha-redirect-uri.dev
	&state=xyz
```

Onde `response_type`= `code`, `client_id` = `minha-aplicacao`, `redirect_uri` = `https://minha-redirect-uri.dev` e `state` = `xyz`.

### Passo 2

Após o usuário ser redirecionado para a nossa URL de autenticação, ele cairá em uma tela como essa:

IMAGEM_LOGIN=~/ll/src/guia/login.png

Que permitirá que ele faça login como vendedor ou consumidor. É esperado que o usuário, nesse momento, preencha os seus dados e faça o login, e então inicia-se o passo 3.
P.S.: caso o usuário já tenha autorizado a aplicação e esses dados ainda estejam guardados no navegador, esse passo é pulado e o passo 3 inicia-se logo após o redirecionamento do passo 1.

### Passo 3

O usuário, após o login ou caso já esteja logado, será redirecionado para a `redirect_uri` em questão. Como citado anteriormente, ela será a passada como parâmetro para ${BASE_URL_AUTH} ou então será a padrão caso somente uma tenha sido cadastrada (no DevPortal). Seguindo os parâmetro do exemplo do passo 1, o usuário seria redirecionado para:

```
https://minha-redirect-uri.dev?state=fj8o3n7bdy1op5
	&session_state=94c44902-0d37-41b2-b6f1-45808ce8eb2f
	&code=6ccdb1f7-eb3d-49f0-894e-90b64dd6ead0.94c44902-0d37-41b2-b6f1-45808ce8eb2f.1e39527d-02aa-4fa0-97c9-fe6ce98fb93e
```

E, dessa forma, você deve receber os parâmetros presentes na URL de redirecionamento e utilizá-los para completar o fluxo. 
Com esses parâmetros em mão, o `state` pode ser utilizado para implementação de proteção contra ataque de CSRF, conforme referenciado anteriormente, e o `session_state` é um identificador interno para identificar a sessão do usuário, que pode ser ignorado por hora. Por fim, o valor de `code` pode ser utilizado para resgatar um `Access Token` válido do usuário consumidor da aplicação, conforme descrito no passo 4.

### Passo 4

Com o valor de `code` em mãos, recebido no passo 3, é possível fazer uma requisição no nosso XXXX e obter um `Access Token`  (JWT) do usuário que autorizou a aplicação. A requisição pode ser feita da seguinte forma:

```curl
curl -X POST "${BASE_URL_TOKEN}"
	--data-urlencode "grant_type=authorization_code"
	--data-urlencode "client_id=$CLIENT_ID"
	--data-urlencode "client_secret=$CLIENT_SECRET"
	--data-urlencode "code=$CODE"
	--data-urlencode "scope=$SCOPE"
```

Onde:
- `$CLIENT_ID` deve ser o client ID da sua aplicação;
	- No nosso exemplo, seria `minha-aplicacao`.
- `$CLIENT_SECRET` deve ser a secret da sua aplicação;
	- Ela pode ser consultada no DevPortal, e é um valor secreto que não deve ser compartilhado em hipótese alguma.
- `$CODE` deve ser o valor recebido no parâmetro `code` após o redirecionamento para a sua `redirect_uri` no passo 3.
	- No nosso exemplo seria `6ccdb1f7-eb3d-49f0-894e-90b64dd6ead0.94c44902-0d37-41b2-b6f1-45808ce8eb2f.1e39527d-02aa-4fa0-97c9-fe6ce98fb93e`.
- `$SCOPE` como citado anteriormente, não precisa ser alterado no momento e pode ser omitido.

### Tokens obtidos

Após a requisição de troca de `code` por `Access Token`, é esperada uma resposta como essa

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhT2ZGNERFOG1PcnFyQjJYeTA3U1dOZzEyTHVfc3BKRThWQnFDb0tGR0VZIn0.eyJleHAiOjE2Mjc0NzczNjcsImlhdCI6MTYyNzQ3NzMwNywianRpIjoiYzc1YzM4YWItODFmYy00ZWQ3LTkyMzUtZjhjNGI3YmQ0MjgyIiwiaXNzIjoiaHR0cHM6Ly9pZC5tYWdhbHUuY29tL2F1dGgvcmVhbG1zL21hc3RlciIsInN1YiI6IjY0OGU4OWUzLTNiZTQtNDhhNy04NmMwLWM4ZWVkNWM0MjA3OCIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1pbmhhLWFwbGljYWNhbyIsInNlc3Npb25fc3RhdGUiOiI1MzgwNDZlYy1mOWE1LTRlMGQtYmUxZC1kNzMxOTU3MWU1YmYiLCJhY3IiOiIxIiwic2NvcGUiOiJzcGktdGVuYW50cyBlbWFpbCIsInRlbmFudHMiOlt7InV1aWQiOiIwMDAwNTVkNS1jYThjLTRjZDUtYmMzOC1jYTVmYTBmOGUyM2EiLCJ0eXBlIjoic3RlbmFnYW0uQ1VTVE9NRVIiLCJpbnRlcm5hbF9pZCI6IjAwMDA1NWQ1LWNhOGMtNGNkNS1iYzM4LWNhNWZhMGY4ZTIzYSJ9LHsidXVpZCI6IjIxZmVhNzNjLWUyNDQtNDk3YS04NTQwLWJlMGQzYzU4MzU5NiIsInR5cGUiOiJzdGVuYWdhbS5TRUxMRVIiLCJpbnRlcm5hbF9pZCI6InN0ZW5hZ2FtX3NhbmRib3gifSx7InV1aWQiOiIyOGNkNzRiNC05YzE0LTRmMjAtYjZlZC1mMjViYTQ0Njc0OGEiLCJ0eXBlIjoibWFnYW5ldHMuQ1VTVE9NRVIiLCJpbnRlcm5hbF9pZCI6IjI4Y2Q3NGI0LTljMTQtNGYyMC1iNmVkLWYyNWJhNDQ2NzQ4YSJ9XSwiYXVkIjoicHVibGljIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJvcmciOiJtYWdhbHUiLCJlbWFpbCI6ImFsY2lkZXNtaWdAZ21haWwuY29tIn0.kq8TmwQ3vs_kSaleTzJNEn4R1HerykK_aQIOH_JeXlEzBYDJVt51Vf1o-rBPaQHE3RgAZdqN73yweW9KRNcSiaCyYfuLM-usY5Kwpd8gJO7T9LqP3fpmxya0ZEV76HYMZoAJaxvg8a11BDV7PjHxfkSEEyq7QU7xMo3w-FuTnSLdBgoNl5ImUtNTmYLJrKiwEKxjfGIpe__XgLsjBcVPYliCGvna_k2RjptWs9BA1C8l3gX__G2mbfMQo0Lo3EBtIgeEhq0YLVEoOf9ZqYOPo_IdC-skgr_V5flBH3FXaI5h7wO-PUkxU6eMGx1DQ6eoKMoDRx3BBR8t1HM7qmeg_w",
  "expires_in": 60,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0ZTBmYWI0Ny01YjFiLTRmNjUtOTRkMS1iMGNmODE2MDQ3ZmEifQ.eyJleHAiOjE2Mjc0NzkxMDcsImlhdCI6MTYyNzQ3NzMwNywianRpIjoiNWU3ZTYwZDMtNjk5MS00ZTAxLTgwMzUtMDdlNGQ1N2MyNzhjIiwiaXNzIjoiaHR0cHM6Ly9pZC5tYWdhbHUuY29tL2F1dGgvcmVhbG1zL21hc3RlciIsImF1ZCI6Imh0dHBzOi8vaWQubWFnYWx1LmNvbS9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJzdWIiOiI2NDhlODllMy0zYmU0LTQ4YTctODZjMC1jOGVlZDVjNDIwNzgiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoibWluaGEtYXBsaWNhY2FvIiwic2Vzc2lvbl9zdGF0ZSI6IjUzODA0NmVjLWY5YTUtNGUwZC1iZTFkLWQ3MzE5NTcxZTViZiIsInNjb3BlIjoic3BpLXRlbmFudHMgZW1haWwifQ.zzPFcKz2A1MMFzeXkRIMMhTSC7whAHSX1fKEFZMAljE",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "538046ec-f9a5-4e0d-be1d-d7319571e5bf",
  "scope": "spi-tenants email"
}
```

Onde o `access_token` é o `Access Token` a ser utilizado pela aplicação, e pode ser de dois formatos, e `scope` tem os valores `default` do nosso provedor de identidade, somados aos pedidos pela aplicação. Observação: os valores `default` de `scope` são, até o momento, `spi-tenants` e `email`.
Estamos trabalhando no desenvolvimento de novos scopes, mas até o momento os pré-configurados como padrão são suficientes para que qualquer parte da API seja utilizada.

Caso a aplicação não peça nenhum `scope` adicional, o que é esperado por hora, o parâmetro `scope` pode ser omitido do request, e então o Access Token quando aberto conterá um payload com o seguinte formato:

```json
{
  "exp": 1627477367,
  "iat": 1627477307,
  "jti": "c75c38ab-81fc-4ed7-9235-f8c4b7bd4282",
  "iss": "https://id.magalu.com/auth/realms/master",
  "sub": "648e89e3-3be4-48a7-86c0-c8eed5c42078",
  "typ": "Bearer",
  "azp": "minha-aplicacao",
  "session_state": "538046ec-f9a5-4e0d-be1d-d7319571e5bf",
  "acr": "1",
  "scope": "spi-tenants email",
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

Tendo esse Access Token em mãos, a aplicação pode consultar os tenants do usuário no `Account` e então fazer as requisições na nossa API. :-)

### Renovação de Access Token

É válido ressaltar, ainda, que o `Refresh Token` pode ser utilizado para renovar o `Access Token` do usuário na mesma sessão, e isso pode ser feito através da seguinte requisição:

```curl
curl -X POST "${BASE_URL_TOKEN}"
	--data-urlencode "grant_type=refresh_token"
	--data-urlencode "client_id=$CLIENT_ID"
	--data-urlencode "client_secret=$CLIENT_SECRET"
	--data-urlencode "refresh_token=$REFRESH_TOKEN"
```

Onde:
- `$CLIENT_ID` deve ser o client ID da sua aplicação;
- `$CLIENT_SECRET` deve ser a secret da sua aplicação;
- `$REFREH_TOKEN` deve ser o Refresh Token obtido no fluxo de obtenção de tokens.

Além disso, a resposta para essa requisição será a mesma da retornada na troca de um `code` por um `Access Token`.

