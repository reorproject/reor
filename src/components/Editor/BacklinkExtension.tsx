import { Extension } from "@tiptap/core";
import {
  Plugin,
  PluginKey,
  TextSelection,
  Transaction,
} from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { SuggestionsState } from "./BacklinkSuggestionsDisplay";

const backlinkPlugin = (
  openRelativePathRef: React.MutableRefObject<
    ((newFilePath: string) => Promise<void>) | undefined
  >,
  updateSuggestionsState: (state: SuggestionsState | null) => void
) => {
  // Timeout to hide the suggestions after a certain amount of time. This is needed so that blur or focusout events don't hide the suggestions immediately.
  let hideTimeout: NodeJS.Timeout | null = null;

  return new Plugin({
    key: new PluginKey("backlinks"),
    state: {
      init(_, { doc }) {
        return DecorationSet.create(doc, []);
      },
      apply(tr, set) {
        return set.map(tr.mapping, tr.doc);
      },
    },
    view() {
      return {
        update: (view) => {
          const { state } = view;
          const { doc, selection } = state;
          const { from } = selection;

          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }

          if (!view.hasFocus()) {
            hideTimeout = setTimeout(() => {
              updateSuggestionsState(null);
            }, 1000);
            return;
          }

          const textBeforeCursor = doc.textBetween(0, from, "\n");
          const lastOpeningBracketIndex = textBeforeCursor.lastIndexOf("[[");

          if (
            lastOpeningBracketIndex === -1 ||
            textBeforeCursor.lastIndexOf("]]") > lastOpeningBracketIndex
          ) {
            updateSuggestionsState(null);
            return;
          }

          const textToLeft = textBeforeCursor.slice(
            lastOpeningBracketIndex + 2,
            from
          );

          const coords = view.coordsAtPos(from);
          coords.left += 5;
          updateSuggestionsState({
            textWithinBrackets: textToLeft,
            position: coords,
            onSelect: (selectedSuggestion) => {
              const tr = view.state.tr;
              const textAfterCursor = doc.textBetween(
                from,
                doc.content.size,
                "\n"
              );
              const closingBracketIndex = textAfterCursor.indexOf("]]");

              if (closingBracketIndex !== -1) {
                tr.replaceWith(
                  from - textToLeft.length,
                  from + closingBracketIndex + 2,
                  view.state.schema.text(selectedSuggestion + "]]")
                );
                view.dispatch(tr);
                updateSuggestionsState(null);
              }
            },
          });
        },
        destroy: () => {
          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }
        },
      };
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

              const bracketsStyle = withinSelectedRange
                ? "color: inherit;"
                : "display: none;";
              decorations.push(
                Decoration.inline(start, backlinkStart, {
                  style: bracketsStyle,
                })
              );
              decorations.push(
                Decoration.inline(backlinkEnd, end, { style: bracketsStyle })
              );

              decorations.push(
                Decoration.inline(backlinkStart, backlinkEnd, {
                  style:
                    "color: #92c8fc; text-decoration: underline; cursor: pointer;",
                  "data-backlink": "true",
                })
              );
            }
          }
        });

        return DecorationSet.create(doc, decorations);
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (event.key === "[") {
            const { state } = view;
            const dispatch = (tr: Transaction) => {
              view.dispatch(tr);
            };

            const { selection } = state;
            const { from } = selection;

            const transaction = state.tr.insertText("]", from);
            const newSelection = TextSelection.create(
              transaction.doc,
              from,
              from
            );

            transaction.setSelection(newSelection);

            dispatch(transaction);

            return true;
          }

          return false;
        },
        click: (view, event) => {
          const { target } = event;
          if (
            target instanceof HTMLElement &&
            target.getAttribute("data-backlink") === "true"
          ) {
            event.preventDefault();
            const backlinkPath = target.textContent;
            if (backlinkPath) openRelativePathRef.current?.(backlinkPath);
          }
          return false; // Not handled
        },
        blur: () => {
          hideTimeout = setTimeout(() => {
            updateSuggestionsState(null);
          }, 500);
          return true;
        },
      },
    },
  });
};

export const BacklinkExtension = (
  openRelativePathRef: React.MutableRefObject<
    ((newFilePath: string) => Promise<void>) | undefined
  >,
  updateSuggestionsState: (state: SuggestionsState | null) => void
) =>
  Extension.create({
    name: "backlink",

    addProseMirrorPlugins() {
      return [backlinkPlugin(openRelativePathRef, updateSuggestionsState)];
    },
  });
