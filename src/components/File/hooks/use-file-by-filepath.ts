import { useState } from "react";

//manage the CRUD operations with underlying file system
export const useFileByFilepath = () => {
	const [filePath, setFilePath] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string>("");
	
	//what if the file is deleted? we need to clear the content of the editor and prevent saving previously loaded content
	const deleteFile = async () => {
		if (filePath === null) {
			return;
		}
		setFileContent("");
		await window.files.deleteFile(filePath);
		setFilePath(null);
	}

	const loadFile = async (path: string) => {
		setFileContent("");
		console.log("loading file: ", path)
		setFilePath(path);
		const initialFileContent = await window.files.readFile(path);
		setFileContent(initialFileContent);
	}

	const setFileContentAndSave = async (content: string) => {
		if (filePath === null) {
			return;
		}
		setFileContent(content);
		console.log("Saving file content to", filePath);
		await window.files.writeFile(filePath, content);
	}

	return {
		fileContent,
		setFileContent: setFileContentAndSave,
		deleteFile,
		filePath,
		onFileSelect: loadFile,
	}
}