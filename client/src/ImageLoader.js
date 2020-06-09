import React from 'react';
import {Img} from 'react-image'

function ImageLoader(src, alt) {
  return <Img src={src} alt={alt} loader={'/tail-spin.svg'} />
}

export default ImageLoader;
