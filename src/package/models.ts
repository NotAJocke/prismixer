export interface Model {
  name: string;
  props: Array<ModelProp>;
}

export interface Enum {
  name: string;
  props: Array<EnumProp>;
}

interface ModelProp {
  name: string;
  type: string;
  args?: Array<string>;
}

interface EnumProp {
  name: string;
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

export interface UserPreferences {
  packageManager: string;
}