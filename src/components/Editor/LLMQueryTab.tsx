import React from "react";
import { Extension } from "@tiptap/react";

const OpenQueryTab = (setShowQueryBox) =>
  Extension.create({
    addKeyboardShortcuts() {
      return {
        "Mod-Shift-l": () => {
          setShowQueryBox((prev) => !prev);
        },
      };
    },
  });

export default OpenQueryTab;
