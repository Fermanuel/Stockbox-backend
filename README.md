# CRM-ADMIN
### Sistemas de gestion y seguimiento de clientes

[![My Skills](https://skillicons.dev/icons?i=ts,postgres,nodejs,docker,nestjs,prisma&theme=light)](https://skillicons.dev)

## Description

Este repositorio contiene el código fuente y la documentación del sistema de gestión de relaciones con clientes (CRM) "CRM-Software". Este CRM ha sido diseñado para proporcionar una solución integral y eficiente para administrar las interacciones de una empresa con sus clientes actuales y potenciales.

```bash
#usuario de pruebas
{
  "data": {
    "id": 1,
    "email": "manuelhola9@gmail.com",
    "first_name": "Fernando",
    "last_name": "Manuel",
    "role": "Administrador",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQ2MzE0NzExLCJleHAiOjE3NDYzMTgzMTF9.zkcXAH7eRevhSjqbi5akWaVZsauUnEeBFolWzPFhSoc"
  }
}

```

## Insatalacion

```bash
# clonar repositorio
$ git clone https://github.com/Fermanuel/server-CRM.git
```


```bash
# Instalacion de dependencios
$ npm install
```

## Levanatar el servidor

> [!NOTE]  
> Si se esta trabajando con **Docker** siga los sigueintes pasos.

1. Desacargue la imagen de `posgresql 16 o superior` [Enlace de desacarga](https://hub.docker.com/_/postgres).
2. cree el contendor donde se estara ejecutando la imagen de docker.

```yml
version: "3.8"
services:
  postgres:
    image: postgres:17.4 (select your version)
    container_name: examlpe-db-container
    restart: always
    environment:
      POSTGRES_USER: example-user
      POSTGRES_PASSWORD: example-password
      POSTGRES_DB: example-db
    volumes:
      - ./postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```
3. realice pruebas de coneccion a su base de datos.
4. utilice el cliente de **SQL** que mejor le ajuste.
5. conectece a la base de datos.

## Comandos para iniciar el servidor

```bash
# desarrollo
$ npm run start

# en espera de cambios (recomendado)
$ npm run start:dev

# produccion
$ npm run start:prod
```

una vez levantado el servidor visite la siguiente ruta en su navegador:

`http://localhost:4000/docs#/`

## License

Nest is [MIT licensed](LICENSE).

