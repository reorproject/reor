import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

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
      const regex = /(\[\[)(.*?)(\]\])/g;
      const { doc, selection } = state;
      const selectionStart = selection.from;
      const selectionEnd = selection.to;

      doc.descendants((node, pos) => {
        if (node.isText) {
          let match;
          while (node.text && (match = regex.exec(node.text)) !== null) {
            const start = pos + match.index;
            const end = start + match[0].length;
            const backlinkStart = start + match[1].length;
            const backlinkEnd = end - match[3].length;
            const withinSelectedRange =
              start <= selectionEnd && end >= selectionStart;

            // Apply styles directly instead of using classes
            const bracketsStyle = withinSelectedRange
              ? "color: inherit;"
              : "display: none;";
            decorations.push(
              Decoration.inline(start, backlinkStart, { style: bracketsStyle })
            );
            decorations.push(
              Decoration.inline(backlinkEnd, end, { style: bracketsStyle })
            );

            // Apply decoration to backlink text with direct style
            decorations.push(
              Decoration.inline(backlinkStart, backlinkEnd, {
                style: "color: blue; text-decoration: underline;",
              })
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
