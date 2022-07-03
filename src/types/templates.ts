export enum TemplateTypes {
  Front = 'front',
  Back = 'back',
  Style = 'styling',
}

export enum CardTypes {
  Basic = 'n2a-basic',
  Input = 'n2a-input',
  Cloze = 'n2a-cloze',
}

export interface TemplateFile {
  parent: string;
  name: string;
  front: string;
  back: string;
  styling: string;
  storageKey: string;
}
