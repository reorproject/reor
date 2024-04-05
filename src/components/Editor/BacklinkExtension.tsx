import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
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
  openFileFunction: (newFilePath: string) => Promise<void>,
  updateSuggestionsState: (state: SuggestionsState) => void
) =>
  new Plugin({
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
                })
              );
            }
          }
        });

        return DecorationSet.create(doc, decorations);
      },
      handleDOMEvents: {
        click: (view, event) => {
          const { target } = event;
          if (target instanceof HTMLElement) {
            // Check if the clicked element or its parent is a backlink-text
            // This might need adjustment depending on how you identify backlink-text elements
            const isBacklinkText =
              target.style.color === "blue" &&
              target.style.textDecoration === "underline";
            if (isBacklinkText) {
              const textContent = target.textContent || "";
              openFileFunction(textContent);
              return true; // Indicate that this event is handled
            }
          }
          return false; // Not handled
        },
        keyup: (view) => {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);

          // Get the entire text from the beginning of the document to the current cursor position
          const textToCursor = view.state.doc.textBetween(0, from, "\n");

          // Find the last occurrence of the opening square bracket before the cursor
          const lastOpeningBracketIndex = textToCursor.lastIndexOf("[[");

          // Check for a newline since the last set of opening square brackets
          const hasNewlineSinceLastBracket = textToCursor
            .slice(lastOpeningBracketIndex)
            .includes("\n");

          // If no opening bracket is found, or the bracket is followed by a closing bracket,
          // or there is a newline character between the last opening bracket and the cursor,
          // do not show suggestions
          if (
            lastOpeningBracketIndex === -1 ||
            textToCursor.includes("]]", lastOpeningBracketIndex) ||
            hasNewlineSinceLastBracket // Added check for newline
          ) {
            updateSuggestionsState({
              suggestions: [],
            });
            return false;
          }

          // Extract the text inside the square brackets (up to the cursor position)
          const textToLeft = textToCursor.slice(
            lastOpeningBracketIndex + 2,
            from
          );

          console.log("Text to the left:", textToLeft);

          // Update shared state with the captured text and coordinates
          updateSuggestionsState({
            text: textToLeft,
            position: coords,
            suggestions: ["Backlink 1", "Backlink 2", "Backlink 3"],
            onSelect: (selectedSuggestion) => {
              const tr = view.state.tr;
              tr.replaceWith(
                from - textToLeft.length,
                from,
                view.state.schema.text(selectedSuggestion)
              );
              view.dispatch(tr);
              updateSuggestionsState({ suggestions: [] });
            },
          });

          return false;
        },
      },
    },
  });

export const BacklinkExtension = (
  openFileFunction: (newFilePath: string) => Promise<void>,
  updateSuggestionsState: (state: SuggestionsState) => void
) =>
  Extension.create({
    name: "backlink",

    addProseMirrorPlugins() {
      return [backlinkPlugin(openFileFunction, updateSuggestionsState)];
    },
  });
