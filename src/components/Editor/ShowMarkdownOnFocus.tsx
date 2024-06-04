import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Heading } from '@tiptap/extension-heading';

const ShowMarkdownOnFocus = Extension.create({
  name: 'showMarkdown',

  addProseMirrorPlugins() {
      return [
          new Plugin({
              props: {
                  handleDOMEvents: {
                      click: (view, event) => {
                          const { pos } = view.posAtCoords({ left: event.clientX, top: event.clientY });
                          if (pos === null) return false;

                          const resolvedPos = view.state.doc.resolve(pos);
                          // const node = resolvedPos.nodeAfter || resolvedPos.nodeBefore;
                          let nodeType = null;
                          let node = null;
                          let depth = 0;

                          for (depth = resolvedPos.depth; depth > 0; depth--) {
                            node = resolvedPos.node(depth);
                            if (node.type.isBlock) {
                              nodeType = node.type.name;
                              break;
                            }
                          }

                          if (node && node.type.name === "heading") {
                              const tr = view.state.tr;

                              console.log(`Clicked header`);
                              if (node.attrs.showMarkdown) {
                                console.log(`Showing markdown`)
                                  // Toggle showMarkdown but do not insert hashes yet
                                  tr.setNodeMarkup(resolvedPos.before(), undefined, { ...node.attrs, showMarkdown: true });
                                  view.dispatch(tr);
                              }
                              return true;
                          }
                          return false;
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
        console.log(domNode.outerHTML);
        domNode.addEventListener('click', () => {
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


        console.log("Listening for input");
        // Handle input to dynamically adjust heading level
        domNode.addEventListener('input', () => {
          const hashCount = (domNode.textContent.match(/^#+/) || [''])[0].length;
          if (hashCount !== node.attrs.level) {
            const cleanedText = currentText.replace("/^#+\s*/", '');
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