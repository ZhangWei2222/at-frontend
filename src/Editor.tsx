import { FC, useRef, useState } from "react";
import AtDialog from "./AtDialog";
import "./editor.less";

type User = { name: string; id: string };

// @ 检测
// @ 选择弹窗
// @xxx -> 替换成 <button>

// 获取光标位置
const getCursorIndex = () => {
  const selection = window.getSelection();
  return selection?.focusOffset;
};

// 获取节点
const getRangeNode = () => {
  const selection = window.getSelection();
  return selection?.focusNode;
};

const getRangeRect = () => {
  const selection = window.getSelection();
  const range = selection?.getRangeAt(0)!;
  const rect = range.getClientRects()[0];
  const LINE_HEIGHT = 30;
  return {
    x: rect.x,
    y: rect.y + LINE_HEIGHT,
  };
};

// 是否展示 @
const showAt = () => {
  const node = getRangeNode();
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const content = node.textContent || "";
  const regx = /@([^@\s]*)$/;
  const match = regx.exec(content.slice(0, getCursorIndex()));
  return match && match.length === 2;
};

// 获取 @ 用户
const getAtUser = () => {
  const content = getRangeNode()?.textContent || "";
  const regx = /@([^@\s]*)$/;
  const match = regx.exec(content.slice(0, getCursorIndex()));
  if (match && match.length === 2) {
    return match[1];
  }
  return undefined;
};

const createAtButton = (user: User) => {
  const btn = document.createElement("span");
  btn.style.display = "inline-block";
  btn.dataset.user = JSON.stringify(user);
  btn.className = "at-button";
  btn.contentEditable = "false";
  btn.textContent = `@${user.name}`;
  const wrapper = document.createElement("span");
  wrapper.style.display = "inline-block";
  wrapper.contentEditable = "false";
  const spaceElem = document.createElement("span");
  spaceElem.style.whiteSpace = "pre";
  spaceElem.textContent = "\u200b";
  spaceElem.contentEditable = "false";
  const clonedSpaceElem = spaceElem.cloneNode(true);
  wrapper.appendChild(spaceElem);
  wrapper.appendChild(btn);
  wrapper.appendChild(clonedSpaceElem);
  return wrapper;
};

const replaceString = (raw: string, replacer: string) => {
  return raw.replace(/@([^@\s]*)$/, replacer);
};

const replaceAtUser = (user: User) => {
  const node = getRangeNode();
  if (node) {
    const content = node?.textContent || "";
    const endIndex = getCursorIndex();
    const preSlice = replaceString(content.slice(0, endIndex), "");
    const restSlice = content.slice(endIndex);
    const parentNode = node?.parentNode!;
    const nextNode = node?.nextSibling;
    const previousTextNode = new Text(preSlice);
    const nextTextNode = new Text("\u200b" + restSlice);
    const atButton = createAtButton(user);
    parentNode.removeChild(node);
    if (nextNode) {
      parentNode.insertBefore(previousTextNode, nextNode);
      parentNode.insertBefore(atButton, nextNode);
      parentNode.insertBefore(nextTextNode, nextNode);
    } else {
      parentNode.appendChild(previousTextNode);
      parentNode.appendChild(atButton);
      parentNode.appendChild(nextTextNode);
    }
    const range = new Range();
    range.setStart(nextTextNode, 0);
    range.setEnd(nextTextNode, 0);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};

const Editor: FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [queryString, setQueryString] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handkeKeyUp = (e: any) => {
    if (showAt()) {
      const position = getRangeRect();
      setPosition(position);
      const user = getAtUser();
      setQueryString(user || "");
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (showDialog) {
      if (
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "Enter"
      ) {
        e.preventDefault();
      }
    }
  };

  const handlePickUser = (user: User) => {
    replaceAtUser(user);
    setShowDialog(false);
  };

  const handleHide = () => {
    setShowDialog(false);
  };

  const handleShow = () => {
    setShowDialog(true);
  };

  return (
    <div>
      <div
        ref={divRef}
        className="editor"
        contentEditable
        onKeyUp={handkeKeyUp}
        onKeyDown={handleKeyDown}
      ></div>
      <AtDialog
        visible={showDialog}
        position={position}
        queryString={queryString}
        onPickUser={handlePickUser}
        onHide={handleHide}
        onShow={handleShow}
      />
    </div>
  );
};

export default Editor;
