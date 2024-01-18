export interface Deserializable {
  deserialize(input: any, additionalData?: any): this;
}
