import Catalog from "@/catalog";
import axios, { AxiosInstance } from "axios";

export default class Arkis {
  _catalog: Catalog;

  constructor(catalogURL: string) {
    this._catalog = new Catalog(catalogURL);
  }

  async catalog() {
    await this._catalog.get();

    return this._catalog;
  }
}
