import { Select, SelectProps, Spin } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import services from "src/app/services";
import { getCurrentChat } from "../../redux/action";

interface UserValue {
  username?: string;
  email?: string;
  id: number;
}

let timeout: ReturnType<typeof setTimeout> | null;

const SearchFriends: React.FC = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState<number>();
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<UserValue[]>([]);

  const handleSearch = async (newValue: string) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (newValue) {
      const fetchUsersList = async () => {
        setFetching(true);
        const res = await services.Auth.searchUsers({ username: newValue });
        if (res.data.users && res.data.users.length) {
          setOptions(res.data.users);
        }
        setFetching(false);
      };
      timeout = setTimeout(fetchUsersList, 500);
    } else {
      setOptions([]);
    }
  };

  return (
    <Select
      value={value}
      showSearch
      style={{ width: "100%" }}
      placeholder="Search users"
      onSearch={handleSearch}
      defaultActiveFirstOption={false}
      showArrow={true}
      filterOption={false}
      onChange={async newValue => {
        setValue(newValue);
        // add user to chat_room
        const res = await services.Chat.addUserToChat({ id: newValue });
        if (res.data) {
          const idChat = res?.data?.chat?.id;
          if (idChat) dispatch(getCurrentChat());
        }
      }}
      options={(options || []).map(item => ({
        value: item.id,
        label: item.username
      }))}
      notFoundContent={fetching ? <Spin size="small" /> : "User not found"}
    />
  );
};

export default SearchFriends;
