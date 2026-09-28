declare module "*.png" {
  const value: string;
  export default value;
}

// @rails/actioncable ships no TypeScript types. We only use `createConsumer`
// and the returned consumer's `subscriptions.create`, so a minimal ambient
// declaration is enough rather than pulling in a types package.
declare module "@rails/actioncable" {
  export interface Subscription {
    unsubscribe(): void;
  }
  export interface Consumer {
    subscriptions: {
      create(
        channel: string | Record<string, unknown>,
        mixin?: Record<string, (...args: any[]) => any>,
      ): Subscription;
    };
  }
  export function createConsumer(url?: string): Consumer;
}
