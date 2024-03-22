// import React, { useState, useEffect } from "react";
// import Modal from "../../Generic/Modal";
// import { LLMConfig } from "electron/main/Store/storeConfig";
// import CustomSelect from "../../Generic/Select";
// import { contextLengthOptions } from "./NewLocalModel";

// interface ContextLengthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   modelConfigs: LLMConfig;
// }

// const ContextLengthModal: React.FC<ContextLengthModalProps> = ({
//   isOpen,
//   onClose,
//   modelConfigs,
// }) => {
//   const [localModelConfigs, setLocalModelConfigs] = useState<
//     Record<string, LLMConfig>
//   >({});

//   useEffect(() => {
//     setLocalModelConfigs({ ...modelConfigs });
//   }, [modelConfigs]);

//   const updateLLMConfig = async (LLMConfig: LLMConfig) => {
//     try {
//       await window.electronStore.updateLLMConfig(LLMConfig);
//       console.log(`Model config updated for ${LLMConfig.modelName}`);
//     } catch (error) {
//       console.error(
//         `Error updating model config for ${LLMConfig.modelName}:`,
//         error
//       );
//     }
//   };

//   const handleContextLengthChange = (modelKey: string, value: string) => {
//     const newContextLength = parseInt(value);
//     setLocalModelConfigs((prevConfigs) => ({
//       ...prevConfigs,
//       [modelKey]: {
//         ...prevConfigs[modelKey],
//         contextLength: newContextLength,
//       },
//     }));

//     updateLLMConfig(modelKey, {
//       ...localModelConfigs[modelKey],
//       contextLength: newContextLength,
//     });
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <div className="w-[300px] ml-3 mr-2 mb-7">
//         {" "}
//         <h3 className="text-lg font-bold text-white mb-1">
//           Context Length Settings
//         </h3>
//         <p className="text-gray-100 mb-5 mt-0 text-sm">
//           Select the context length for each local model you&apos;ve added
//           below.
//         </p>
//         {Object.entries(localModelConfigs)
//           .filter(([, config]) => config.engine === "llamacpp")
//           .map(([modelKey, config]) => (
//             <div key={modelKey} className=" mt-8">
//               <h4 className="text-white mt-0 mb-1">{modelKey}:</h4>
//               <CustomSelect
//                 options={contextLengthOptions}
//                 value={config.contextLength?.toString() || ""}
//                 onChange={(value) => handleContextLengthChange(modelKey, value)}
//               />
//             </div>
//           ))}
//         {/* if list is empty print something: */}
//         {Object.entries(localModelConfigs).filter(
//           ([, config]) => config.engine === "llamacpp"
//         ).length === 0 ? (
//           <p className="text-gray-100 text-sm mb-0 mt-0 italic">
//             You haven&apos;t added any local models yet.
//           </p>
//         ) : (
//           <p className="text-gray-100 text-xs mb-0 mt-5">
//             <i>
//               If you experience a crash, try lowering the context length. If you
//               get a context length error, increase it.
//             </i>
//           </p>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default ContextLengthModal;
