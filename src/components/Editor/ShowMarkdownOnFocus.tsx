// import { Extension } from "@tiptap/core";
// import { Heading } from "@tiptap/extension-heading";
// import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
// import { Decoration, DecorationSet } from "prosemirror-view";

// const hoverPluginKey = new PluginKey("hoverState");
// const stateTrackerKey = new PluginKey("stateTracker");

// const ShowMarkdownOnFocus = Extension.create({
//   name: "showMarkdown",

//   addProseMirrorPlugins() {
//     return [
//       new Plugin({
//         key: stateTrackerKey,
//         state: {
//           init() {
//             return {
//               oldState: null,
//               newState: null,
//               value: null,
//               lastHeaderPos: null,
//               currentHeaderPos: null,
//             };
//           },
//           apply(tr, value, oldState, newState) {
//             const { $head } = newState.selection;
//             value.lastHeaderPos = value.currentHeaderPos;
//             if ($head.parent.type.name === "heading") {
//               value.currentHeaderPos = $head.pos - $head.parentOffset;
//             }
//             value.oldState = oldState;
//             value.newState = newState;
//             return value;
//           },
//         },
//         props: {
//           handleDOMEvents: {
//             keydown: (view, event) => {
//               // Small timeout to allow the document to re-render
//               const preUpdatePos = view.state.selection.$from.parentOffset;
//               const preUpdateText =
//                 view.state.selection.$from.parent.textContent;
//               const preStart = view.state.selection.$from.start();
//               const preEnd = view.state.selection.$from.start();
//               const pos = view.state.selection.$from.pos;
//               const preNodeSize = view.state.selection.$from.parent.nodeSize;
//               setTimeout(() => {
//                 const pluginState = stateTrackerKey.getState(view.state);

//                 const { state, dispatch } = view;
//                 const { selection, tr } = state;
//                 const { $from, $to, $head, empty } = selection;
//                 const { oldState, newState, lastHeaderPos } = pluginState;
//                 const node = $from.parent;

//                 // Behavior dealing with going to next line/splitting header up
//                 if (event.key === "Enter") {
//                   if (!empty) return false; // Prosemirror will handle non-empty selection

//                   if (node.type.name === "heading") {
//                     event.preventDefault(); // Prevent the default Enter action

//                     if (preUpdatePos === 0) {
//                       // Enter at start of header
//                       const newNode = node.type.createAndFill(node.attrs);
//                       tr.insert($from.pos, newNode);
//                     } else {
//                       // TODO: Hide Markdown when splitting in middle of word.
//                     }
//                   } else {
//                     // At the end of the header and pressing enter.
//                     hideMarkdownHashes(state, view, oldState);
//                   }
//                 } else if (
//                   (event.key === "Backspace" || event.key === "Delete") &&
//                   node.type.name === "heading" &&
//                   $head.parentOffset === 0
//                 ) {
//                   event.preventDefault();
//                   // Check if we're at the start of the node
//                   const headerText = node.textContent.slice(node.attrs.level);
//                   if ($from.parentOffset <= node.attrs.level) {
//                     const paragraphType = state.schema.nodes.paragraph;

//                     // Replace the entire node with a paragraph containing the text without hashes
//                     const textContent = headerText.trim();
//                     const textNode = state.schema.text(textContent);
//                     const paragraphNode = paragraphType.create(null, textNode);
//                     tr.replaceRangeWith(
//                       $from.start(),
//                       $from.end(),
//                       paragraphNode
//                     );

//                     dispatch(tr.scrollIntoView());
//                     return true;
//                   }
//                 } else {
//                   const currentPos = $head.pos - $head.parentOffset;
//                   const isSectionHeader = $head.parent.type.name === "heading";
//                   // If this is not a sectionHeader, we need to hide the hashes
//                   if (
//                     !isSectionHeader ||
//                     (isSectionHeader && currentPos !== lastHeaderPos)
//                   ) {
//                     hideMarkdownHashes(state, view, oldState);
//                   }

//                   if (isSectionHeader) {
//                     const pos = $head.before();
//                     const node = $head.parent;

//                     // Just hovered over a header, display hashes
//                     if (!node.attrs.showMarkdown) {
//                       const hashText = "#".repeat(node.attrs.level) + " ";
//                       const endPos = pos + node.nodeSize;
//                       const transaction = state.tr;

//                       // Update the text to show hashes and setShowmarkdown to true
//                       transaction.insertText(hashText, pos + 1);
//                       transaction.setNodeMarkup(pos, null, {
//                         ...node.attrs,
//                         showMarkdown: true,
//                       });
//                       view.dispatch(transaction);
//                     }
//                   }
//                 }
//                 return true;
//               }, 10);
//               return false;
//             },
//             input: (view, event) => {
//               setTimeout(() => {
//                 const { state } = view;
//                 const { selection } = state;
//                 const { $head } = selection;
//                 const node = $head.parent;

//                 if (node.type.name === "heading") {
//                   const newText = node.textContent;
//                   const hashCount = newText.match(/^#+/g)?.[0].length || 1;
//                   if (node.attrs.level !== hashCount) {
//                     const transaction = state.tr;
//                     const startPos = $head.before();
//                     const endPos = startPos + node.nodeSize;
//                     const newContent = state.schema.text(
//                       "#".repeat(hashCount) +
//                         " " +
//                         newText.trim().replace(/^#+\s*/, "")
//                     );
//                     const newNode = node.type.create(
//                       { ...node.attrs, showMarkdown: true, level: hashCount },
//                       newContent
//                     );

//                     transaction.replaceRangeWith(startPos, endPos, newNode);

//                     // Calculate new position of cursor. This is important because if we do not do this, sometimes the cursor will go to the next line
//                     const newCursorPos = startPos + hashCount + 1;
//                     transaction.setSelection(
//                       TextSelection.near(transaction.doc.resolve(newCursorPos))
//                     );

//                     view.dispatch(transaction);
//                     return true;
//                   }
//                 }
//                 return false;
//               }, 10);
//             },
//           },
//         },
//       }),
//     ];
//   },
// });

// const CustomHeading = Heading.extend({
//   addAttributes() {
//     return {
//       showMarkdown: {
//         default: false,
//       },
//     };
//   },

//   addNodeView() {
//     return ({ node, editor, getPos }) => {
//       const domNode = document.createElement("h" + node.attrs.level);
//       domNode.textContent = node.textContent;
//       domNode.setAttribute(`contenteditable`, `true`);

//       return {
//         dom: domNode,
//         contentDOM: domNode,
//       };
//     };
//   },
// });

// // Hides the markdown hashes after no longer focusing.
// const hideMarkdownHashes = (state, view, oldState) => {
//   const lastPos = oldState.doc.resolve(oldState.selection.$head.pos);
//   if (lastPos.parent.type.name === "heading") {
//     const start = lastPos.start();
//     const end = lastPos.end();
//     const textContent = lastPos.parent.textContent.replace(/^(#+\s*)+/, "");
//     const transaction = state.tr;
//     const newNode = lastPos.parent.type.create(
//       { ...lastPos.parent.attrs, showMarkdown: false },
//       state.schema.text(textContent)
//     );

//     transaction.replaceRangeWith(start, end, newNode);
//     view.dispatch(transaction);
//   }
// };

// export { ShowMarkdownOnFocus, CustomHeading };
