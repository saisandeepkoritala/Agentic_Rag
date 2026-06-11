import { Document } from "@langchain/core/documents";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {TextLoader} from "@langchain/classic/document_loaders/fs/text";


type SupportedMime = 'application/pdf' | 'text/markdown' | 'text/plain';

interface LoadFileArgs{
    filePath : string,
    mimeType : string,
    originalName : string
};


function getExtension(name :  string){
    const index = name.lastIndexOf(".");
    return index===-1 ? '' : name.slice(index+1).toLowerCase();
};

export async function loadFileAsDocuments(args  : LoadFileArgs) :  Promise<Document[]>{
    const  {filePath,mimeType,originalName} = args;

    const extractExtension = getExtension(originalName);

    const isMarkdown = mimeType ==="text/markdown" ||extractExtension === "md" || extractExtension === "markdown";

    const  isText =  mimeType === "text/plain"  || extractExtension === "txt";

    const isPdf = mimeType ==="application/pdf" || extractExtension === "pdf";


    if(isPdf){
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        return docs.map(doc =>({
            ...doc,
            metadata : {
                ...doc.metadata,
                source : originalName
            }
        }))
    }

    if(isText || isMarkdown){
        const loader = new TextLoader(filePath);
        const docs = await loader.load();
        return docs.map(doc =>({
            ...doc,
            metadata : {
                ...doc.metadata,
                source : originalName
            }
        }))
    }

    return []; // Unsupported fileType
};