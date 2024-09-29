import Catalog from "@/catalog";
import Distro from "@/distro";
import axios from "axios";
import crypto from "crypto";

export default class Dataset {
  url: string;
  data: any;
  catalog: Catalog;

  // TODO: Properly type this
  distros: {
    ids: string[];
    list: {
      [key: string]: {
        format: string;
        accessURL: string;
      };
    };
  } = {
    ids: [],
    list: {},
  };

  constructor(url: string, catalog: Catalog) {
    this.url = url;
    this.catalog = catalog;
  }

  distro(id: string) {
    if (!this.distros.ids.includes(id))
      throw new Error("Distribution not found");

    return new Distro(this.distros.list[id], this);
  }

  async get() {
    const { data } = await axios.get(this.url).catch((e) => ({
      data: {
        success: false,
        message: e.message,
      },
    }));

    this.data = this.remap(data);

    const dt = Object.values(this.data.dcat.distribution).map((v: any) => [
      crypto.createHash("md5").update(v["@id"]).digest("hex"),
      [
        crypto.createHash("md5").update(v["@id"]).digest("hex"),
        {
          format: v.dcterms.format,
          accessURL: v.dcat.accessURL,
        },
      ],
    ]);

    this.distros.ids = dt.map((v: any[]) => v[0]);
    this.distros.list = Object.fromEntries(dt.map((v: any[]) => v[1]));

    return data.success == false ? null : data;
  }

  // TODO: Properly type this
  remap(data: any) {
    if (!this.catalog.context) throw new Error("Context not found");

    const out: {
      [key: string]: any;
    } = {};

    Object.entries(data).forEach(([key, value]) => {
      if (this.catalog.context[key]) {
        if (this.catalog.context[key].split(":").length > 1) {
          if (!out[this.catalog.context[key].split(":")[0]])
            out[this.catalog.context[key].split(":")[0]] = {};

          out[this.catalog.context[key].split(":")[0]][
            this.catalog.context[key].split(":")[1]
          ] = typeof value == "string" ? value : this.remap(value);
        } else out[this.catalog.context[key]] = value;
        return;
      }

      out[key] = typeof value == "string" ? value : this.remap(value);
    });

    return out;
  }
}
