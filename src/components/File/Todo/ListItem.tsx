import React from "react";
import { useNodeViewContext } from "@prosemirror-adapter/react";
import type { FC, ReactElement } from "react";
import 'prosemirror-view/style/prosemirror.css';

export const ListItem: FC = () => {
  const { contentRef,  selected } = useNodeViewContext();

  return (
    <li
      className={[
        "flex-column flex",
        selected ? "ProseMirror-selectednode" : "",
      ].join(" ")}
    >
      <ListSubItem />
      <span className="min-w-0" ref={contentRef}/>
    </li>
    
  );
};



const ListSubItem = ():  ReactElement  =>{
  const { node, setAttrs } = useNodeViewContext();

  const isChecked = node.attrs?.checked;
  const isBullet = isChecked == null && node.attrs?.listType === 'bullet'; //hacky way to check if it's a bullet list, because node view context is returning the wrong listType for checkbox
  const isOrderedListItem = node.attrs?.listType === 'ordered';

  let content: ReactElement;
  if( isChecked != null) {
    return <input
    className="form-checkbox rounded"
    onChange={() => setAttrs({ checked: !isChecked })}
    type="checkbox"
    checked={isChecked}
    />
  }

  if(isOrderedListItem) {
    content = <span className="custom-oli w-4">{node.attrs.label}</span>;
  } else if (isBullet) {
    content = <span className="custom-li rounded-full w-4"></span>;
  } else {
    content = <span className="text-nord8">{node.attrs?.label}</span>;
  } 

  return <span className="flex h-7 items-end">
            {content} 
        </span>
}