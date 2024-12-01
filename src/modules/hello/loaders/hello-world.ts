import { LoaderOptions } from '@medusajs/framework/types';

// recommended to define type in another file
type ModuleOptions = {
  capitalize?: boolean;
};

export default async function helloWorldLoader({
  options,
}: LoaderOptions<ModuleOptions>) {
  console.log('[HELLO MODULE] Just started the Medusa application!', options);
}
