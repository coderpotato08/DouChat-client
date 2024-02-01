import { AddFriendParamsType, SearchUserParamsType } from "@constant/api-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Avatar, Button, GlobalToken, Input, Modal, message, theme } from "antd"
import { debounce, isEmpty } from "lodash";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

const { useToken } = theme;
interface AddFriendModalProps {
  visible: boolean,
  onCancel: () => void,
}
const AddFriendModal:FC<AddFriendModalProps> = (props: AddFriendModalProps) => {
  const { token } = useToken()
  const userInfo = useAppSelector(userSelector);
  const [keyWord, setKeyWord] = useState<string>("");
  const [userList, setUserList] = useState<any[]>([]);

  const onCancel = () => {
    setKeyWord("")
    setUserList([])
    props.onCancel()
  }

  const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = e;
    setKeyWord(value);
  }

  const onSearch = useMemo(() => {
    return debounce((params: SearchUserParamsType) => {
      ApiHelper.searchUsers(params)
        .then((res: any) => {
          setUserList(res.userList.map((user: any) => ({
            ...user,
            hasApplied: false,
          })))
        })
    }, 500)
  }, [])

  const onAddFriend = (userId: string) => {
    const params: AddFriendParamsType = {
      userId: userInfo._id,
      friendId: userId,
    }
    ApiHelper.addFriend(params)
      .then((res: any) => {
        const { status, message: msg } = res;
        const isSuccess = status === "success"
        msg && message[isSuccess ? "success" : "warning"](msg);
        if(isSuccess) {
          setUserList((preUserList) => preUserList.map((user) => ({
            ...user,
            hasApplied: userId === user._id ? true : user.hasApplied,
          })))
        }
      })
  }

  useEffect(() => {
    if(!keyWord) {
      setUserList([]);
      return;
    }
    onSearch({ 
      keyWord: keyWord, 
      currUserId: userInfo._id 
    })
  }, [keyWord])

  return <Modal title={"添加好友"}
                open={props.visible} 
                onCancel={onCancel}
                footer={null}>
    <Wrapper $token={token}>
      <SearchWrapper>
        <Input placeholder={"请输入昵称或账号"}
               value={keyWord}
               onChange={onChangeValue}/>
      </SearchWrapper>
      {!isEmpty(userList) && <div className="tips">
        共查询到<span>{userList.length}</span>个用户
      </div>}
      {
        keyWord && <UserListWrapper>
          {
            !isEmpty(userList) ? userList.map((user) => {
              return user._id !== userInfo._id ? <UserItem key={user._id} $token={token}>
                <Avatar className={"avatar"} src={user.avatarImage} size={42}/>
                <div>{user.nickname}</div>
                <div className={"tags"}>
                  {
                    !user.isFriend ? <Button type={"primary"}
                                             disabled={user.hasApplied}
                                             onClick={() => onAddFriend(user._id)}>
                      {user.hasApplied ? "待添加" : "添加好友"}
                    </Button> : <div className="is-friend">
                      已是好友
                    </div>
                  }
                </div>
              </UserItem> : null
            }) : <NoUserData>
              暂未查询到用户
            </NoUserData>
          }
        </UserListWrapper>
      }
    </Wrapper>
  </Modal>
}

export default AddFriendModal;

const Wrapper = styled.div<{
  $token: GlobalToken
}>`
  & {
    .tips {
      font-size: 12px;
      margin-bottom: 8px;
      > span:nth-child(1) {
        font-weight: 600;
        color: ${props => props.$token.colorPrimary}
      }
    }
  }
`

const SearchWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
`

const UserListWrapper = styled.div`
  & {
    display: grid;
    gap: 10px;
    width: 100%;
    max-height: 350px;
    overflow-y: scroll;
  }
`
const UserItem = styled.div<{
  $token: GlobalToken
}>`
  & {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    align-items: center;
    padding: 8px 12px;
    border: 2px solid #ececec;
    border-radius: 4px;
    transition: all .4s;
    position: relative;
    .avatar {
      margin-right: 12px;
    }
    .tags {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 12px;
      .is-friend {
        color: #666;
      }
    }
  }
  &:hover {
    background-color: ${props => props.$token.colorPrimaryBg};
    border-color: ${props => props.$token.colorPrimary};
  }
`
const NoUserData = styled.div`
  & {
    width: 100%;
    text-align: center;
    line-height: 60px;
    height: 60px;
    font-size: 16px;
    color: #333;
  }
`