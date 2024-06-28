import { Extension } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react";
import "../../styles/global.css";

/**
 * 
 * Options:
 * 	Cut
 * 	Copy
 * 	Paste
 * 	Paste without formatting
 * 	Delete
 * 	------------------------
 * 	Insert
 * 	Format
 * 
 * @param editor
 * @returns Dropdown menu to perform actions on selected text
 * 
 */
const MenuOnHighlight = ({ editor }) => {

	const isTextCurrentlySelected = () => {
		return !editor.state.selection.empty;
	}

	return (
		<BubbleMenu editor={editor} tippyOptions={{ duration: 10, placement: 'bottom' }}>
			<div className="bubble-menu">
				<div>
					<button
						onClick={() => { editor.commands.cut() }}
						className={`${isTextCurrentlySelected() ? "dark-orange-500" : ""}`}
					>
						Cut
					</button>
				</div>
				<button
					onClick={() => { editor.commands.copy() }}
					className={`${isTextCurrentlySelected() ? "dark-orange-500" : ""}`}
				>
					Copy
				</button>
				{/*
				<button
					onClick={ }
					className={ }
				>
					Paste
				</button>
				<button
					onClick={ }
					className={ }
				>
					Paste without formatting
				</button>
				<button
					onClick={ }
					className={ }
				>
					Delete
				</button>
				<button
					onClick={ }
					className={ }
				>
					Insert
				</button>
				<button
					onClick={ }
					className={ }
				>
					Format
				</button> */}
				{/* <button
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive('bold') ? 'is-active' : ''}
				>
					Bold
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive('italic') ? 'is-active' : ''}
				>
					Italic
				</button>
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={editor.isActive('strike') ? 'is-active' : ''}
				>
					Strike
				</button> */}
			</div>
		</BubbleMenu>
	)
};



/**
 * Custom Commands for dropdown menu
 */
export const CustomMenuCommands = Extension.create({
	name: "clipboardCommands",

	addCommands() {
		return {
			copy: () => copyCommand(this.editor.state, this.editor.view.dispatch),
			cut: () => cutCommand(this.editor.state, this.editor.view.dispatch),
			bold: () => this.editor.chain().focus().toggleBold().run(),
			italic: () => this.editor.chain().focus().toggleItalic().run(),
			strike: () => this.editor.chain().focus().toggleStrike().run(),
		}
	}
});


const copyCommand = (state: any, dispatch: any) => {
	if (state.selection.empty) return false;

	const { from, to } = state.selection;
	const text = state.doc.textBetween(from, to, ' ');


	navigator.clipboard.writeText(text).then(() => {
		console.log("Text has been copied")
	}).catch((err) => {
		console.error("Failed to copy:", err);
	});

	return true;
}

const cutCommand = (state: any, dispatch: any) => {
	if (state.selection.empty) return false;

	copyCommand(state, dispatch);

	// Remove text from the document
	if (dispatch)
		dispatch(state.tr.deleteSelection().scrollIntoView());

	return true;
}


export default MenuOnHighlight;