declare const bootstrap: any;

declare namespace TCIC {
  module Common {
    interface Item<T> {
      id: any;
      text: string;
      val?: T;
      children?: Item<T>[];
    }
  }
}
