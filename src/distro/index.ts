import Dataset from "@/dataset";
import axios from "axios";

export default class Distro {
  distro: {
    format: string;
    accessURL: string;
  };
  dataset: Dataset;

  constructor(
    distro: {
      format: string;
      accessURL: string;
    },
    dataset: Dataset,
  ) {
    this.distro = distro;
    this.dataset = dataset;
  }

  async download() {
    const { data } = await axios.get(this.distro.accessURL).catch((e) => ({
      data: {
        success: false,
        message: e.message,
      },
    }));

    return data;
  }
}
