import axios from "axios";
import Catalog from ".";

export default class CatalogContext {
  catalog: Catalog;

  constructor(catalog: Catalog) {
    this.catalog = catalog;
  }

  // TODO: Properly type this
  async get(catalog: any) {
    const address = catalog["@context"];

    const { data } = await axios.get(address).catch((e) => ({
      data: {
        success: false,
        message: e.message,
      },
    }));

    return data.success == false ? null : data["@context"];
  }

  map(data: { [key: string]: string | { [key: string]: string } }) {
    const out: {
      [key: string]: string;
    } = {};

    Object.entries(data).forEach(([key, value]) => {
      out[key] = typeof value == "string" ? value : value["@id"];
    });

    return out;
  }

  reverseMap(data: {
    [key: string]:
      | string
      | {
          "@id": string;
          "@type"?: string;
          "@container"?: string;
        };
  }) {
    const out: {
      [key: string]:
        | string
        | {
            [key: string]: string;
          };
    } = {};

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value == "string") {
        if (key.toLowerCase().split("")[0] == key.split("")[0])
          out["_" + key] = value;
        else {
          if (value.split(":").length > 1) {
            // something:Else = "def" not used currently
            return;
          }

          out[value] = key;
        }
        return;
      }

      const id = value["@id"];

      if (id.split(":").length > 1) {
        if (!out[id.split(":")[0]]) out[id.split(":")[0]] = {};

        (
          out[id.split(":")[0]] as {
            [key: string]: string;
          }
        )[id.split(":")[1]] = key;

        return;
      }

      throw new Error("Wrong context value");
    });

    return out;
  }
}
