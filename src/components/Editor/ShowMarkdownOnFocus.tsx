import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Heading } from '@tiptap/extension-heading';

const hoverPluginKey = new PluginKey('hoverState');
const stateTrackerKey = new PluginKey('stateTracker');

const ShowMarkdownOnFocus = Extension.create({
  name: 'showMarkdown',

  addProseMirrorPlugins() {
      return [
          new Plugin({
              key: stateTrackerKey,
              state: {
                init() {
                    return {oldState: null, newState: null, value: null};
                  },
                  apply(tr, value, oldState, newState) {
                    value.oldState = oldState;
                    value.newState = newState;
                    return value;
                  }
                },
              props: { 
                  handleDOMEvents: {
                      keydown: (view, event) => {
                          // Small timeout to allow the document to re-render
                          setTimeout(() => {
                            const pluginState = stateTrackerKey.getState(view.state);
                            const { oldState, newState } = pluginState
                            // const oldInHeading = oldState.selection.$head.parent.type.name === 'heading';
                            // const newInHeading = newState.selection.$head.parent.type.name === 'heading';
                            // const currentPos = newState.selection.$head.pos;
                            // const currentDepth = newState.selection.$head.depth;

                            const { state } = view;
                            const { selection } = state;
                            const { $head } = selection;
                            const isSectionHeader = $head.parent.type.name === "heading";
                            // If this is not a sectionHeader, we need to hide the hashes
                            if (!isSectionHeader) {
                              console.log(`No longer in section header`);
                              const $lastPos = oldState.doc.resolve(oldState.selection.$head.pos);
                              console.log(`LastPos: ${JSON.stringify($lastPos.path[0].content)}`);
                              if ($lastPos.parent.type.name === 'heading') {
                                const start = $lastPos.start();
                                const end = $lastPos.end();
                                const textContent = $lastPos.parent.textContent.replace(/^(#+\s*)+/, '');
                                const transaction = state.tr;
                                const newNode = $lastPos.parent.type.create({...$lastPos.parent.attrs, showMarkdown: false}, state.schema.text(textContent));

                                // transaction.replaceRangeWith(start, end, view.state.schema.text(textContent));
                                console.log(">>> Hid node");
                                transaction.replaceRangeWith(start, end, newNode);
                                // transaction.setNodeMarkup(start, null, { ...$lastPos.parent.attrs, showMarkdown: false });
                                view.dispatch(transaction);

                              }
                              return false;
                            }

                            const pos = $head.before();
                            const node = $head.parent;

                            // Just hovered over a header, display hashes
                            // console.log(`Node attrs: ${node.attrs.showMarkdown}`);
                            if (!node.attrs.showMarkdown) {
                              const hashText = '#'.repeat(node.attrs.level) + ' ';
                              const endPos = pos + node.nodeSize;
                              const transaction = state.tr;

                              // Update the text to show hashes and setShowmarkdown to true
                              transaction.insertText(hashText, pos + 1);
                              transaction.setNodeMarkup(pos, null, { ...node.attrs, showMarkdown: true });
                              view.dispatch(transaction);
                            }
                            return true;
                          }, 10);
                          return false;
                      },
                      input: (view, event) => {
                          setTimeout(() => {
                          const { state } = view;
                          const { selection } = state;
                          const { $head } = selection;
                          const node = $head.parent;

                          if (node.type.name === "heading") {
                            const newText = node.textContent;
                            const hashCount = newText.match(/^#+/g)?.[0].length || 1;

                            if (node.attrs.level !== hashCount) {
                              const transaction = state.tr;
                              const startPos = $head.before();
                              const endPos = startPos + node.nodeSize;
                              const newContent = state.schema.text('#'.repeat(hashCount) + ' ' + newText.trim().replace(/^#+\s*/, ''));

                              const newNode = node.type.create({...node.attrs, showMarkdown: true, level:hashCount}, newContent);

                              transaction.replaceRangeWith(startPos, endPos, newNode);

                              // Calculate new position of cursor. This is important because if we do not do this, sometimes the cursor will go to the next line
                              const newCursorPos = startPos + hashCount + 1;
                              transaction.setSelection(TextSelection.near(transaction.doc.resolve(newCursorPos)));

                              view.dispatch(transaction);
                              return true;
                            }
                          }
                          console.log(`Returning false`);
                          return false;
                        }, 10);
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