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
                    const { pos} = view.posAtCoords({ left: event.clientX, top: event.clientY });
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
                        let tr = view.state.tr;

                        console.log(`Clicked header`);
                        if (!node.attrs.showMarkdown) {
                            const hashText = '#'.repeat(node.attrs.level) + ' ';

                            // Add hash text and mark the node as markdownActive
                            tr = tr.setNodeMarkup(resolvedPos.before(), undefined, {...node.attrs, showMarkdown: true});
                            tr = tr.insertText(hashText, resolvedPos.start());
                            view.dispatch(tr);
                        }
                        return true;
                    }
            
                    return false;
                },
                blur: (view, event) => {
                    const { doc, tr } = view.state;
                    doc.descendants((node, pos) => {
                    if (node.type.name === 'heading' && node.attrs.showMarkdown) {
                        const cleanedText = node.textContent.replace(/^[# ]+/, '');
                        tr.setNodeMarkup(pos, null, { ...node.attrs, showMarkdown: false });
                        tr.replaceRangeWith(pos + 1, pos + node.nodeSize, view.state.schema.text(cleanedText));
                    }
                    });
                    if (tr.docChanged) {
                    view.dispatch(tr);
                    }
                    return false;
                },
            },
          },

        }),
      ];
    },
  });
  


const CustomHeading = Heading.extend({
    // addNodeView() {
    //     return ({ node, editor, getPos }) => {
    //         console.log("Extending header functionality");
    //         const domNode = document.createElement('h' + node.attrs.level);
    //         domNode.contentEditable = 'true';

    //     }
    // }
    // return ({})
})




export { ShowMarkdownOnFocus, CustomHeading }