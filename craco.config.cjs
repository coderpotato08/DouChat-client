const path = require("path");
/**
 * @type {import('@craco/types').CracoConfig}
 */
module.exports = {
  //webpack配置
  webpack: {
    //配置别名
    alias: {
      //约定使用@代表src文件所在路径
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@router": path.resolve(__dirname, "./src/router"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@helper": path.resolve(__dirname, "./src/helper"),
      "@constant": path.resolve(__dirname, "./src/constant"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@service": path.resolve(__dirname, "./src/service"),
    },
  },
};
