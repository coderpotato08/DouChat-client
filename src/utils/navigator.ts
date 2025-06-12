/**
 * 获取用户媒体设备流（兼容屏幕共享/摄像头/麦克风）
 * @param type 媒体类型：'screen' | 'camera' | 'audio'
 * @param options 媒体配置（可选）
 * @returns Promise<MediaStream>
 */
export async function getUserMediaStream(
  type: 'screen' | 'camera' | 'audio' = 'screen',
  options?: {
    video?: boolean | MediaTrackConstraints;
    audio?: boolean | MediaTrackConstraints;
  }
): Promise<MediaStream> {
  try {
    // 环境兼容性检查
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持媒体设备API');
    }

    let stream: MediaStream;

    // 根据类型调用不同API
    switch (type) {
      case 'screen':
        if (!navigator.mediaDevices.getDisplayMedia) {
          throw new Error('您的浏览器不支持屏幕共享');
        }
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: options?.video ?? true,
          audio: options?.audio ?? false, // 屏幕共享默认不带音频
        });
        break;

      case 'camera':
        stream = await navigator.mediaDevices.getUserMedia({
          video: options?.video ?? true,
          audio: options?.audio ?? false,
        });
        break;

      case 'audio':
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: options?.audio ?? true,
        });
        break;

      default:
        throw new Error('不支持的媒体类型');
    }

    // 检查是否实际获取到轨道
    if (
      (type === 'screen' || type === 'camera') &&
      stream.getVideoTracks().length === 0
    ) {
      throw new Error('未获取到视频轨道');
    }
    if (type === 'audio' && stream.getAudioTracks().length === 0) {
      throw new Error('未获取到音频轨道');
    }

    return stream;
  } catch (error) {
    // 统一处理常见错误类型
    let errorMessage = '获取媒体设备失败';
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = '用户拒绝了权限请求';
          break;
        case 'NotFoundError':
          errorMessage = '未找到指定的媒体设备';
          break;
        case 'NotReadableError':
          errorMessage = '设备已被占用或无法访问';
          break;
        case 'OverconstrainedError':
          errorMessage = '无法满足配置要求';
          break;
      }
    }
    console.error(`[getUserMediaStream] ${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
}