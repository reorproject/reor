// import React from "react";
import { useNodeViewContext } from "@prosemirror-adapter/react";
import type { FC } from "react";
import 'prosemirror-view/style/prosemirror.css';

export const ListItem: FC = () => {
  const { contentRef, node, setAttrs, selected } = useNodeViewContext();
  const { attrs } = node;
  const checked = attrs?.checked;
  const isBullet = checked == null; //hacky way to check if it's a bullet list, currently the node view context is returning the wrong listType for bullet lists

  return (
    <li
      className={[
        "flex-column flex",
        selected ? "ProseMirror-selectednode" : "",
      ].join(" ")}
    >
      <span className="flex h-7 items-end">
        {checked != null ? (
          <input
            className="form-checkbox rounded"
            onChange={() => setAttrs({ checked: !checked })}
            type="checkbox"
            checked={checked}
          />
        ) : isBullet ? (
          <span className="custom-li"></span>
        ) : (
          <span className="text-nord8">{attrs?.label}</span>
        )}
      </span>
      <span className="min-w-0" ref={contentRef}/>
    </li>
    
  );
};
