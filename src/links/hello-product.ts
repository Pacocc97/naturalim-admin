import HelloModule from '../modules/hello';
import ProductModule from '@medusajs/medusa/product';
import { defineLink } from '@medusajs/framework/utils';

export default defineLink(
  ProductModule.linkable.product,
  {
    linkable: HelloModule.linkable.myCustom,
    isList: true,
    // deleteCascade: true,
  },
  //   HelloModule.linkable.myCustom,
);
