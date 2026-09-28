import { createConsumer, Consumer } from "@rails/actioncable";

// Single shared ActionCable consumer for the whole app. Created lazily so
// importing this module has no side effects until a subscription is
// actually created (keeps it inert in Jest, which doesn't run a real
// WebSocket server).
let consumer: Consumer | null = null;

export const getConsumer = (): Consumer => {
  if (!consumer) consumer = createConsumer();
  return consumer;
};
