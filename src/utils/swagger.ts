import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
// 引用到package.json中的name
import * as packageConfig from '../../package.json'
export const generateDocument = (app) => {
  const options = new DocumentBuilder()
    //文档的标题
    .setTitle(packageConfig.name)
    //文档描述
    .setDescription(packageConfig.description)
    .setVersion(packageConfig.version)
    .addBearerAuth() // 增加鉴权功能
    .build()

  const document = SwaggerModule.createDocument(app, options)
  //访问文档的URL
  SwaggerModule.setup('/api/doc', app, document)
}
