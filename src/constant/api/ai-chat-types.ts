/** deepseek 对话补全 */
export interface DsCompletionsParams {
  /** 会话id */
  chatSessionId: string,
  /** 提问 */
  prompt: string,
  /** 附属文件 */
  refFileIds?: string[],
  /** 是否深度思考 */
  thinkingEnable: boolean,
}