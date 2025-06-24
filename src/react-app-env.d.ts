/// <reference types="react-scripts" />

// This file is needed for TypeScript to recognize JSX in .tsx files
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
