# Arkis
TypeScript library for parsing ArcGIS datasets.

## Example
```ts
const arkis = new Arkis("https://link.to/arcgis/api");
const catalog = await arkis.catalog();
const dataset = await catalog.datasets.find((d) => d.nam == "MyDataset");

if (!dataset) throw new Error("Dataset not found");

const distro = await dataset.distros.find(DataFormat.DB);

if (!distro) throw new Error("Distribution not found");

const data = await distro.download();

console.log(data);
```

## Authors
- [Martin Petr](https://github.com/MartinGamesCZ)

## License
The library is licensed under the MIT license. Please respect and follow licenses of the datasets.