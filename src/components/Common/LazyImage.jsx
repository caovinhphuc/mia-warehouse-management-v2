/**
 * LazyImage - Tối ưu tải ảnh với loading="lazy", decoding="async"
 * Dùng thay <img> khi cần lazy load (below-the-fold images)
 */
import React from "react";

const LazyImage = ({
  src,
  alt = "",
  className = "",
  style = {},
  loading = "lazy",
  decoding = "async",
  ...props
}) => (
  <img
    src={src}
    alt={alt}
    loading={loading}
    decoding={decoding}
    className={className}
    style={style}
    {...props}
  />
);

export default LazyImage;
