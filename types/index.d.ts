declare const TCIC_SPY: any;

declare const bootstrap: any;

declare namespace TCIC {
  module Common {
    interface Item<T> {
      id: string;
      text: string;
      val?: T;
      children?: Item<T>[];
    }
  }
}
