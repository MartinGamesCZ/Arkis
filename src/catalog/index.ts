import axios, { AxiosInstance } from "axios";
import CatalogContext from "./context";
import datasetUrlToId from "@/dataset/id";
import Dataset from "@/dataset";
import { IFindableDataset } from "@/types/dataset";

export default class Catalog {
  url: string;
  data: any; // TODO: Properly type this
  context: any; // TODO: Properly type this

  datasets: {
    ids: string[];
    urls: {
      [key: string]: string;
    };
    find: (
      searchFn: (dset: IFindableDataset) => boolean,
    ) => Promise<Dataset | null>;
    names: () => Promise<{ [key: string]: string }>;
  } = {
    ids: [],
    urls: {},

    find: async (searchFn) => {
      for (const id of this.datasets.ids) {
        const dset = await this.dataset(id);

        if (
          searchFn({
            id: datasetUrlToId(dset.data["@id"]),
            name: dset.data.dcterms.title[
              Object.keys(dset.data.dcterms.title)[0]
            ], // TODO: Add support for multiple languages
          })
        )
          return dset;
      }

      return null;
    },

    names: async () => {
      const names: { [key: string]: string } = {};

      for (const id of this.datasets.ids) {
        const dset = await this.dataset(id);

        names[id] =
          dset.data.dcterms.title[Object.keys(dset.data.dcterms.title)[0]];
      }

      return names;
    },
  };

  constructor(url: string) {
    this.url = url;
  }

  async dataset(id: string) {
    if (!this.datasets.ids.includes(id)) throw new Error("Dataset not found");

    const dset = new Dataset(this.datasets.urls[id], this);

    await dset.get();

    return dset;
  }

  async get() {
    const { data } = await axios.get(this.url).catch((e) => ({
      data: {
        success: false,
        message: e.message,
      },
    }));

    const ctx = new CatalogContext(this);

    this.context = ctx.map(await ctx.get(data));

    this.data = this.remap(data);

    const ds = this.data.dcat.dataset.map((dataset: string) => [
      datasetUrlToId(dataset),
      dataset,
    ]);

    this.datasets.ids = ds.map((dataset: any[]) => dataset[0]);
    this.datasets.urls = Object.fromEntries(ds);

    return data;
  }

  remap(object: any) {
    if (!this.context) throw new Error("Context is not loaded");

    const out: any = {};

    Object.entries(object).forEach(([key, value]) => {
      if (this.context[key]) {
        if (this.context[key].split(":").length > 1) {
          if (!out[this.context[key].split(":")[0]])
            out[this.context[key].split(":")[0]] = {};

          out[this.context[key].split(":")[0]][
            this.context[key].split(":")[1]
          ] = value;
        } else out[this.context[key]] = value;
        return;
      }

      out[key] = value;
    });

    return out;
  }
}
