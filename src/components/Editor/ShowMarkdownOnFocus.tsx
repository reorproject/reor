import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Heading } from '@tiptap/extension-heading';

const hoverPluginKey = new PluginKey('hoverState');
const markdownHeaderPluginKey = new PluginKey('markdownState');

const ShowMarkdownOnFocus = Extension.create({
  name: 'showMarkdown',

  addProseMirrorPlugins() {
      return [
          new Plugin({
            key: markdownHeaderPluginKey,

            state: {
              init() {
                return { lastInHeading: false, lastHeadingPos: null };
              },
              apply(tr, value, oldState, newState, view) {
                // console.log(`OldState: ${JSON.stringify(oldState)}\n\n\nNewState: ${JSON.stringify(newState)}`);
                // console.log(`oldHead: ${oldState.selection.$head}\n\nNewHead: ${newState.selection.$head}`);
                let lastInHeading = value.lastInHeading;
                let lastHeadingPos = value.lastHeadingPos;

                const oldInHeading = oldState.selection.$head.parent.type.name === 'heading';
                const newInHeading = newState.selection.$head.parent.type.name === 'heading';
                const currentPos = newState.selection.$head.pos;
                const currentDepth = newState.selection.$head.depth;

                // Updating old State
                if (newInHeading) {
                  lastInHeading = true;
                  lastHeadingPos = newState.selection.$head.before();
                } else {
                  lastInHeading = false;
                }

                console.log(`CurrentPos: ${currentPos}... OldPos: ${oldState.selection.$head.pos}`);
                if (oldInHeading && !newInHeading) {
                  // Get the position and node where last heading was located
                  const $lastPos = oldState.doc.resolve(oldState.selection.$head.pos);
                  if ($lastPos.parent.type.name === "heading") {
                    const start = $lastPos.start();
                    const end = $lastPos.end();
                    const textContent = $lastPos.parent.textContent.replace(/^(#+\s*)+/, '');
                    console.log(`Start: ${start}, End: ${end}, TextContent: ${textContent}`);
                    // console.log("Document content before:", oldState.doc.textContent);

                    // tr.replaceRangeWith(start, end, oldState.schema.text(textContent));
                    // let newState = oldState.apply(tr);
                    // console.log("Document content after applying transaction:", newState.doc.textContent);
                    const newHeadingNode = oldState.schema.nodes.heading.create($lastPos.parent.attrs, oldState.schema.text(textContent));
                    // tr.replaceRangeWith(start, end, newHeadingNode);
                    tr.replaceWith(0, )
                    console.log(tr.steps);
                  }
                }
                
                return {
                  lastInHeading: newInHeading,
                  lastHeadingPos: newInHeading ? newState.selection.$head.before() : null
                };
              }
            },
              props: {
                  handleDOMEvents: {
                      keydown: (view, event) => {
                          // Small timeout to allow the document to re-render
                          // console.log("BEFORE TIMEOUT")
                          setTimeout(() => {
                            const { state } = view;
                            const { selection } = state;
                            const { $head } = selection;
                            const isSectionHeader = $head.parent.type.name === "heading";
                            if (!isSectionHeader) return false;
                            // Check if the selection head is a heading node
                            const pos = $head.before();
                            // console.log(`Instead header. Pos: ${pos}`);
                            const node = $head.parent;
                            // console.log(`Node: ${$head}`);
                            if (!node.attrs.showMarkdown) {
                              const hashText = '#'.repeat(node.attrs.level) + ' ';
                              const endPos = pos + node.nodeSize;
                              const transaction = state.tr;

                              // Update the text to show hashes and setShowmarkdown to true
                              transaction.insertText(hashText, pos + 1);
                              transaction.setNodeMarkup(pos, null, { ...node.attrs, showMarkdown: true });
                              view.dispatch(transaction);
                            }
                            console.log(`returning true`);
                            return true;
                          }, 500);
                          return true;
                      },
                  }
              }
          })
      ];
  },
});

const CustomHeading = Heading.extend({
    addAttributes() {
      return {
        showMarkdown: {
          default: false
        }
      };
    },

    addNodeView() {
      return ({ node, editor, getPos }) => {
        const domNode = document.createElement('h' + node.attrs.level);
        domNode.textContent = node.textContent;
        domNode.setAttribute(`contenteditable`, `true`);

        // Listen for focus
        console.log(`DomNode: ${domNode.outerHTML}`);
        domNode.addEventListener('keydown', () => {
          console.log(`Focusing!`);
          if (!node.attrs.showMarkdown) {
              const hashText = '#'.repeat(node.attrs.level) + ' ';
              // Create a transaction to update the text
              const startPos = getPos() + 1; // Assuming the text starts right after the node start
              const endPos = startPos + node.textContent.length;
              const transaction = editor.view.state.tr;
              transaction.replaceRangeWith(startPos, endPos, editor.view.state.schema.text(hashText + node.textContent));
              transaction.setNodeMarkup(getPos(), null, { ...node.attrs, showMarkdown: true });
              editor.view.dispatch(transaction);
          }
      });


        // Handle input to dynamically adjust heading level
        domNode.addEventListener('input', () => {
          const hashCount = (domNode.textContent.match(/^#+/) || [''])[0].length;
          console.log(`Inside input.. Hash: ${hashCount} vs node.attrs: ${node.attrs.level}`);

          if (hashCount !== node.attrs.level) {
            console.log(`Current: ${currentText}`);
            const cleanedText = currentText.replace("/^#+\s*/", '');
            console.log(`Cleaned: ${cleanedText}`);
            const transaction = editor.view.state.tr.setNodeMarkup(getPos(), undefined, {
                ...node.attrs,
                level: hashCount,
                showMarkdown: true
            });
            transaction.replaceRangeWith(getPos()+1, getPos() + 1 + node.textContent.length, editor.view.state.schema.text(cleanedText));
            editor.view.dispatch(transaction);
          }
        });

        // Clear markdown on blur
        domNode.addEventListener('blur', () => {
            console.log("Blur called");
            if (node.attrs.showMarkdown) {
              const cleanedText = domNode.textContent.replace(/^#+\s*/, '');
              transaction.replaceRangeWith(getPos() + 1, getPos() + 1 + domNode.textContent.length, editor.view.state.schema.text(cleanedText));
              transaction.setNodeMarkup(getPos(), null, { ...node.attrs, showMarkdown: false });
              editor.view.dispatch(transaction);
            }
        });
      

        return {
          dom: domNode,
          contentDOM: domNode
        };
      };
    }
});




export { ShowMarkdownOnFocus, CustomHeading }