import { FC } from "react";

// 获取光标位置
const getCursorIndex = () => {
  const selection = window.getSelection();
  //   console.log("getRangeNode", selection?.focusOffset, selection?.anchorOffset);
  return selection?.focusOffset;
};

// 获取节点
const getRangeNode = () => {
  const selection = window.getSelection();
  //   console.log("getRangeNode", selection?.anchorNode, selection?.focusNode);
  return selection?.focusNode;
};

// 是否展示 @
const showAt = () => {
  const node = getRangeNode();
  // 如果没有内容 或者 节点不是文本
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const content = node.textContent || "";
  //   console.log("node", node, getCursorIndex());

  // 正则：/@([^@\s]*)$/，@表示之后的字串原意表达，即无需转义
  // 匹配@开头，后面无空白的字段
  const regx = /@([^@\s]*)$/;
  const match = regx.exec(content.slice(0, getCursorIndex()));
  console.log("match", match);
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

const getRangeRect = () => {
  const selection = window.getSelection();
  const range = selection?.getRangeAt(0)!;
  console.log("range", range, selection?.focusNode);
  const rect = range.getClientRects()[0];
  const LINE_HEIGHT = 0;
  return {
    x: rect.x,
    y: rect.y + LINE_HEIGHT,
  };
};

const SelectionDemo: FC = () => {
  const handkeKeyUp = (e: any) => {
    // console.log("handkeKeyUp");
    if (showAt()) {
      const position = getRangeRect();
      console.log("弹窗位置", position);
      const user = getAtUser();
      console.log("有@，用户名为：", user);
    } else {
      // console.log('无@')
    }
  };

  return (
    <div>
      <div contentEditable onKeyUp={handkeKeyUp}></div>
    </div>
  );
};

export default SelectionDemo;
