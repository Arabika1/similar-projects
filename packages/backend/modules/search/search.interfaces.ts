import { IRepositoryData } from "providers/github/github.intefaces";

export interface IResponse extends IRepositoryData {
  count: number;
}
