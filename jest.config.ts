import { InitialOptionsTsJest } from 'ts-jest/dist/types'

module.exports = <InitialOptionsTsJest>{
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [ './jest.setup.ts' ],
}
