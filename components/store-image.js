import Image from "next/image";
import { isProductUploadUrl } from "@/lib/product-upload-url";

export default function StoreImage({ src, ...props }) {
  return <Image src={src} unoptimized={isProductUploadUrl(src)} {...props} />;
}
