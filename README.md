# babbling-on-backend

Babbling On backend is running NodeJS

## Setup

1. run `npm` to install packages
2. create `.env` file add the following variables (ask a team member for the values)

```
DATABASE_URL=...
```

3. start the express server locally `npm run dev`

### Deploying to Google Cloud App Engine

##### Requirements

- Python 3 (3.7 - 3.9)
- gcloud CLI (https://cloud.google.com/sdk/docs/install) Note: while configuring gCloud CLI, ensure it is targeting `babbling-on-2023` project

`npm deploy` deploys the app to App Engine

## Prisma

Creating tables in prisma is done by creating a new model in the `schema.prisma` file. Then running `npx prisma migrate dev --name <name of migration>` to create a new migration. Then running `npx prisma migrate deploy` to deploy the migration to the database. `npx prisma db push` can be used to push the schema to the database without creating a migration. To pull changes from the database to the schema run `npx prisma db pull`.

Documentation for prisma can be found [here](https://www.prisma.io/docs/concepts/components/prisma-schema).

Here is all available datatypes for prisma SQL: [here](https://www.prisma.io/docs/concepts/database-connectors/mysql#native-type-mapping-from-prisma-to-mysql)

How Prisma Works [here](https://www.prisma.io/docs/concepts/components/prisma-client)
