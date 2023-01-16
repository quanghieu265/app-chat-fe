import { Select, Spin } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import services from "src/app/services";
import { getCurrentChat } from "../../redux/action";

interface UserValue {
  username?: string;
  email?: string;
  id: number;
}

interface OptionValue {
  disabled?: boolean;
  key?: string;
  label: string;
  title?: string;
  value: number;
}

interface DebounceSelectProps {
  value?: OptionValue;
  placeholder?: string;
  fetchOptions: (value: string) => Promise<any>;
  debounceTimeout?: number;
  onChange?: (newValue: OptionValue) => void;
}

const { Option } = Select;

function DebounceSelect({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: DebounceSelectProps) {
  const _ = require("lodash");

  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<UserValue[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return _.debounce(loadOptions, debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      style={{ width: "100%" }}
      showSearch
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : "User not found"}
      {...props}
    >
      {options.map((item) => (
        <Option key={item.id} value={item.id} label={item.username}>
          {item.username}
        </Option>
      ))}
    </Select>
  );
}

async function fetchUserList(username: string): Promise<UserValue[]> {
  const res = await services.Auth.getUser();
  const users = res.data;
  return users.filter((user: UserValue) => {
    return user.username?.includes(username);
  });
}

const SearchFriends: React.FC = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState<OptionValue>();
  return (
    <DebounceSelect
      value={value}
      placeholder="Search users"
      fetchOptions={fetchUserList}
      onChange={async (newValue: OptionValue) => {
        setValue(newValue);
        // add user to chat_room
        const res = await services.Chat.addUserToChat({ id: newValue.value });
        const idChat = res?.data?.id;
        if (idChat) dispatch(getCurrentChat());
      }}
    />
  );
};

export default SearchFriends;
