import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const backlinkPlugin = new Plugin({
  key: new PluginKey("backlinks"),
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, []);
    },
    apply(tr, set) {
      // Logic to update decorations based on document changes
      return set.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      const decorations: Decoration[] = [];
      const regex = /\[\[(.*?)\]\]/g;
      const { doc, selection } = state;
      const selectionStart = selection.from;
      const selectionEnd = selection.to;

      doc.descendants((node, pos) => {
        if (node.isText) {
          let match;
          while (node.text && (match = regex.exec(node.text)) !== null) {
            const start = pos + match.index;
            const end = start + match[0].length;
            // Check if the cursor or selection is within the backlink
            const withinSelectedRange =
              start <= selectionEnd && end >= selectionStart;

            // If within range, apply the backlink class, else apply a class that hides the brackets
            const className = withinSelectedRange
              ? "backlink"
              : "backlink-hidden";
            // const className = "backlink";
            decorations.push(
              Decoration.inline(start, end, { class: className })
            );
          }
        }
      });
      return DecorationSet.create(doc, decorations);
    },
  },
});

export const BacklinkExtension = Extension.create({
  name: "backlink",

  addProseMirrorPlugins() {
    return [backlinkPlugin];
  },
});
