// 解构peerId拿到消息发送接收者
export const getFromToByPeerId = (
  peerId: string, 
  currUserId: string
): {
  from: string, 
  to: string
} => {
  const userIds = peerId.split("_");
  return {
    from: userIds[0] === currUserId ? userIds[0] : userIds[1],
    to: userIds[0] === currUserId ? userIds[1] : userIds[0],
  }
}

// 处理peerId
export const formatPeerId = (id_a: string, id_b: string) => {
  let arr = [id_a, id_b];
  return arr.sort().join("_")
}