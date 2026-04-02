// Web3Modal Custom Elements Declaration
declare namespace JSX {
  interface IntrinsicElements {
    'w3m-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        balance?: string;
        size?: string;
        label?: string;
      },
      HTMLElement
    >;
    'w3m-modal': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}

export {};
