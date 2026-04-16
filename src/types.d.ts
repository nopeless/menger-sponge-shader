declare module "lil-gui" {
  interface Controller {
    trigger(): Controller;
    stubDisplay<T>(fn: (this: Controller, v: T) => string): Controller;
    customDisplayFn: (this: Controller, v: unknown) => string;
  }

  interface GUI {
    labelWithValue<T>(
      name: string,
      value: T,
      $1?: number | object | any[],
      max?: number,
      step?: number,
    ): Controller;
  }
}
export {};
