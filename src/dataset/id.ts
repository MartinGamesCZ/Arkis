export default function datasetUrlToId(url: string) {
  return url.split("/").reverse()[0].split(".")[0];
}
