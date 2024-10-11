import Dataset from "@/dataset";
import axios from "axios";

export default class Distro {
  distro: {
    format: string;
    accessURL: string;
  };
  dataset: Dataset;
  isDB: boolean;

  constructor(
    distro: {
      format: string;
      accessURL: string;
    },
    dataset: Dataset,
    isDB: boolean = false
  ) {
    this.distro = distro;
    this.dataset = dataset;
    this.isDB = isDB;
  }

  async download() {
    const { data } = await axios
      .get(
        this.distro.accessURL +
          (this.isDB ? "/query?outFields=*&where=1%3D1&f=geojson" : "")
      )
      .catch((e) => ({
        data: {
          success: false,
          message: e.message,
          url:
            this.distro.accessURL +
            (this.isDB ? "/query?outFields=*&where=1%3D1&f=geojson" : ""),
        },
      }));

    console.log(
      this.distro.accessURL +
        (this.isDB ? "/query?outFields=*&where=1%3D1&f=geojson" : "")
    );

    return data;
  }
}
