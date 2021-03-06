import { FC, useEffect, useState, useRef } from "react";
import "./AtDialog.scss";

type User = { name: string; id: string };

const mockData = [
  {
    name: "易烊千玺",
    id: "yiyangqianxi",
  },
  {
    name: "王俊凯",
    id: "wangjunkai",
  },
  {
    name: "王源",
    id: "wangyuan",
  },
];

const searchUser = (queryString?: string) => {
  return queryString
    ? mockData.filter(({ name }) => name.startsWith(queryString))
    : mockData.slice(0);
};

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  queryString?: string;
  onPickUser: (user: User) => void;
  onHide: () => void;
  onShow: () => void;
}

const AtDialog: FC<Props> = (props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [index, setIndex] = useState(-1);
  const usersRef = useRef<{ id: string; name: string }[]>();
  usersRef.current = users;
  const indexRef = useRef<number>();
  indexRef.current = index;
  const visibleRef = useRef<boolean>();
  visibleRef.current = props.visible;

  useEffect(() => {
    const filterdUsers = searchUser(props.queryString);
    setUsers(filterdUsers);
    setIndex(0);
    if (!filterdUsers.length) {
      props.onHide();
    }
  }, [props.queryString]);

  useEffect(() => {
    const keyDownHandler = (e: any) => {
      if (visibleRef.current) {
        if (e.code === "Escape") {
          props.onHide();
          return;
        }
        if (e.code === "ArrowDown") {
          setIndex((oldIndex) => {
            return Math.min(oldIndex + 1, (usersRef.current?.length || 0) - 1);
          });
          return;
        }
        if (e.code === "ArrowUp") {
          setIndex((oldIndex) => Math.max(0, oldIndex - 1));
          return;
        }
        if (e.code === "Enter") {
          if (
            indexRef.current !== undefined &&
            usersRef.current?.[indexRef.current]
          ) {
            props.onPickUser(usersRef.current?.[indexRef.current]);
            setIndex(-1);
          }
          return;
        }
      }
    };
    document.addEventListener("keyup", keyDownHandler);
    return () => {
      document.removeEventListener("keyup", keyDownHandler);
    };
  }, []);

  return (
    <>
      {props.visible ? (
        <div
          style={{
            position: "fixed",
            top: props.position.y,
            left: props.position.x,
          }}
          className="wrapper"
        >
          {users.length ? "" : "无搜索结果"}
          {users.map((user, i) => {
            return (
              <div
                key={user.id}
                className={i === index ? "active item" : "item"}
              >
                <div className="name">{user.name}</div>
                <div className="id">{user.id}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

export default AtDialog;
