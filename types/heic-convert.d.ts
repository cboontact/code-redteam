declare module "heic-convert" {
  type HeicConvertOptions = {
    buffer: ArrayBuffer | Buffer | Uint8Array;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  export default function heicConvert(
    options: HeicConvertOptions
  ): Promise<ArrayBuffer>;
}