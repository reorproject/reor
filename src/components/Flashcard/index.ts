import { removeFileExtension } from "@/functions/strings";
import { toast } from "react-toastify";

export const QUESTION_FORMAT = "Q:";
export const ANSWER_FORMAT = "A:";
export const CONVERT_TO_FLASHCARDS_FROM_CHAT =
  "Convert the above message to flashcards";

export interface FlashcardQAPair {
  question: string;
  answer: string;
}

export const canBeParsedAsFlashcardQAPair = (line: string): boolean => {
  return line.includes(QUESTION_FORMAT) && line.includes(ANSWER_FORMAT);
};

export const parseFlashcardQAPair = (line: string): FlashcardQAPair => {
  if (!canBeParsedAsFlashcardQAPair(line)) {
    toast.error(
      `Invalid flashcard format. It should include both ${QUESTION_FORMAT} and ${ANSWER_FORMAT}`
    );
  }
  const [question, answer] = line.split("<br/>"); // it is always in the order of Q: and A:
  return {
    question: question.replace(QUESTION_FORMAT, "").trim(),
    answer: answer.replace(ANSWER_FORMAT, "").trim(),
  };
};

export const storeFlashcardPairsAsJSON = async (
  qnaPairs: FlashcardQAPair[],
  currentFilePath: string | null
) => {
  if (!currentFilePath) {
    toast.error("No file currently selected. Please open a file.");
    return;
  }
  const fileName = await window.path.basename(currentFilePath);
  const trimmedFileName = removeFileExtension(fileName);
  const filePath = await window.files.joinPath(
    window.electronStore.getUserDirectory(),
    ".flashcards",
    `${trimmedFileName}.json`
  );
  await window.files.writeFile({
    filePath: filePath,
    content: JSON.stringify(
      {
        fileGeneratedFrom: currentFilePath,
        qnaPairs: qnaPairs,
      },
      null,
      4
    ),
  });
  toast.success("Flashcard file generated!");
};
