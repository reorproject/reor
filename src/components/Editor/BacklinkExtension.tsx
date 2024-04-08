import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface SuggestionsState {
  // showSuggestions: boolean;
  text?: string;
  position?: {
    left: number;
    top: number;
  };
  suggestions: string[];
  onSelect?: (selectedSuggestion: string) => void; // Add this line
}

const backlinkPlugin = (
  updateSuggestionsState: (state: SuggestionsState) => void
) => {
  let hideTimeout: NodeJS.Timeout | null = null;

  return new Plugin({
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
    view() {
      return {
        update: (view) => {
          const { state } = view;
          const { doc, selection } = state;
          const { from } = selection;

          // Clear the previous timeout if it exists
          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }

          // Check if the editor does not have focus
          if (!view.hasFocus()) {
            // Set a timeout to hide the suggestions after a short delay
            hideTimeout = setTimeout(() => {
              updateSuggestionsState({ suggestions: [] });
            }, 1000); // Adjust the delay as needed (in milliseconds)
            return;
          }

          const textBeforeCursor = doc.textBetween(0, from, "\n");
          const lastOpeningBracketIndex = textBeforeCursor.lastIndexOf("[[");

          if (
            lastOpeningBracketIndex === -1 ||
            textBeforeCursor.lastIndexOf("]]") > lastOpeningBracketIndex
          ) {
            updateSuggestionsState({ suggestions: [] });
            return;
          }

          const textToLeft = textBeforeCursor.slice(
            lastOpeningBracketIndex + 2,
            from
          );

          const coords = view.coordsAtPos(from);
          updateSuggestionsState({
            text: textToLeft,
            position: coords,
            suggestions: ["Backlink 1", "Backlink 2", "Backlink 3"],
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
                updateSuggestionsState({ suggestions: [] });
              }
            },
          });
        },
        destroy: () => {
          // Clear the timeout when the view is destroyed
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

              // Apply styles directly instead of using classes
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

              // Apply decoration to backlink text with direct style
              decorations.push(
                Decoration.inline(backlinkStart, backlinkEnd, {
                  style:
                    "color: blue; text-decoration: underline; cursor: pointer;",
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
            const { state, dispatch } = view;
            const { selection } = state;
            const { from } = selection;

            // Insert the closing bracket at the cursor position.
            const transaction = state.tr.insertText("]", from);

            // Create a new selection that places the cursor back by one position, before the inserted closing bracket.
            // Since we are inserting at `from`, the cursor should ideally end up at `from` again (before the inserted text).
            const newSelection = TextSelection.create(
              transaction.doc,
              from,
              from
            );

            // Apply the new selection to the transaction.
            transaction.setSelection(newSelection);

            // Dispatch the transaction with the updated document and selection.
            dispatch(transaction);

            // Prevent the default handling to ensure no additional brackets are inserted.
            return true;
          }

          // Allow default handling for other keys.
          return false;
        },
        blur: () => {
          // Set a timeout to hide the suggestions after a short delay
          hideTimeout = setTimeout(() => {
            updateSuggestionsState({
              suggestions: [],
            });
          }, 500); // Adjust the delay as needed (in milliseconds)
          return true;
        },
      },
    },
  });
};

export const BacklinkExtension = (
  // openFileFunction: (newFilePath: string) => Promise<void>,
  updateSuggestionsState: (state: SuggestionsState) => void
) =>
  Extension.create({
    name: "backlink",

    addProseMirrorPlugins() {
      return [backlinkPlugin(updateSuggestionsState)];
    },
  });
