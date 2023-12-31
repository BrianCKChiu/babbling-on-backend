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

Creating tables in prisma is done by creating a new model in the `schema.prisma` file.

- `npx prisma db pull` will pull the database schema into the prisma schema file
- `npx prisma db push` will push the prisma schema file to the database
- `npx prisma generate` will generate the prisma client
- `npx prisma seed` will seed the database with the data in the `seed.ts` file

Documentation for prisma can be found [here](https://www.prisma.io/docs/concepts/components/prisma-schema).

Here is all available datatypes for prisma SQL: [here](https://www.prisma.io/docs/concepts/database-connectors/mysql#native-type-mapping-from-prisma-to-mysql)

How Prisma Works [here](https://www.prisma.io/docs/concepts/components/prisma-client)

# Testing

All commits will jest tests. To manually run jest test, run `npx jest` in the root directory.

### Creating Tests

Put tests in the respective `__tests__` folder. For example, if you are testing a component, put the test in `src/components/__tests__`. If you are testing a route, put the test in `src/route/__tests__`.

### Firebase

Firebase test environment is tested locally. It requires [Firebase CLI](https://firebase.google.com/docs/cli) to be installed. Run `npm install -g firebase-tools` and sign in to firebase using `firebase login`. Run `firebase emulators:start` to start the firebase emulator. The emulator UI will run on `localhost:4000`.

| Emulator       | Port | URL                             |
| -------------- | ---- | ------------------------------- |
| Firestore      | 8089 | http://localhost:4000/firestore |
| Authentication | 9099 | http://localhost:4000/auth      |
| Storage        | 9199 | http://localhost:4000/storage   |

### Prisma

Prisma DB testing uses a singleton method to mock the Prisma DB. [Read More](https://www.prisma.io/docs/guides/testing/unit-testing#example-unit-tests).
