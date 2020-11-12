// FAKE NATS implementation to allow Jest tests to run without connecting to
// a Nats service
const mockClientPublishFN = (
  subject: string,
  data: string,
  callback: () => void
) => {
  callback();
};

export const natsClient = {
  instance: {
    publish: jest.fn().mockImplementation(mockClientPublishFN),
  },
};
