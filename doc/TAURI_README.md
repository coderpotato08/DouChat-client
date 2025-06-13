# tauri接入时遇到的问题与解决

1. tauri环境下无法获取媒体流
在mac环境下 tauri无法获取到浏览器navigator下的mediaDevices对象，在mac环境下需要在src-tauri的根目录下加个配置文件`info.plist`,内容如下
```plist
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
    <key>NSCameraUsageDescription</key>
    <string>请允许本程序访问您的摄像头</string>
  </dict>
  </plist>
```
