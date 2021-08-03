jest.mock("../utils/prisma", () => global.__PRISMA__)
jest.mock("ioredis", () => jest.requireActual("ioredis-mock/jest"))
