import { Module } from "@medusajs/framework/utils"
import HelloModuleService from "./service"
import helloWorldLoader from "./loaders/hello-world"



export const HELLO_MODULE = "helloModuleService"

export default Module(HELLO_MODULE,{
    service: HelloModuleService,
    loaders: [helloWorldLoader]
})