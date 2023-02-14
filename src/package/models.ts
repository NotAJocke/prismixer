export interface Model {
  name: string;
  props: Array<Prop>;
}

interface Prop {
  name: string;
  type: string;
  args?: Array<string>;
}

export interface Datasource {
  name: string;
  provider: string;
  url: string;
}

export interface Generator {
  name: string;
  provider: string;
  output?: string;
}