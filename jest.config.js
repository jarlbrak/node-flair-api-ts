// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(jest|spec).[jt]s?(x)'],
  testPathIgnorePatterns: ['/dist/'],
};
