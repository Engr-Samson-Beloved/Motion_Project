export type UserAsset = {name: string; dataUrl: string; type: string; size: number};
export type AssetMap = Readonly<Record<string, string>>;

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = new Set(["image/png", "image/jpeg", "image/webp"]);

export const readUserImage = (file: File): Promise<UserAsset> => {
  if (!ACCEPTED.has(file.type)) {
    return Promise.reject(new Error("Choose a PNG, JPEG, or WebP image."));
  }
  if (file.size > MAX_BYTES) {
    return Promise.reject(new Error("Each image must be 5 MB or smaller."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(`Could not read ${file.name}.`));
        return;
      }
      const name = file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/^\.+/, "")
        .slice(0, 120) || "reference-image";
      resolve({name, dataUrl: reader.result, type: file.type, size: file.size});
    };
    reader.readAsDataURL(file);
  });
};

export const assetMap = (assets: readonly UserAsset[]): AssetMap =>
  Object.fromEntries(assets.map((asset) => [asset.name, asset.dataUrl]));

/** Keep multimodal requests bounded while preserving the full local render asset. */
export const prepareImageReference = async (asset: UserAsset) => {
  const image = await createImageBitmap(await (await fetch(asset.dataUrl)).blob());
  const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error(`Could not prepare ${asset.name} for visual reference.`);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return {name: asset.name, type: "image/jpeg", dataUrl: canvas.toDataURL("image/jpeg", 0.84)};
};
