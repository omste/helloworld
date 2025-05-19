const superjson = {
  stringify: jest.fn((data) => JSON.stringify(data)),
  parse: jest.fn((str) => JSON.parse(str)),
  serialize: jest.fn((data) => ({ json: data })),
  deserialize: jest.fn((data) => data.json),
};

export default superjson; 