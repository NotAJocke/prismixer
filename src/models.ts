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
  props: DatasourceProps[]
}

export interface Generator {
  name: string;
  props: GeneratorProps[]
}

interface DatasourceProps {
  name: string;
  value: string;
}

interface GeneratorProps extends DatasourceProps {}