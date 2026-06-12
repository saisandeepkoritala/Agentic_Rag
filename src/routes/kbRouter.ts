import multer from 'multer';
import { Router } from 'express';
import { loadFileAsDocuments } from '@/kb/01_loaders';
import { splitDocuments } from '@/kb/02_splitter';
import { ingestDocuments } from '@/kb/04_ingest';

export const kbRouter = Router();


const upload = multer({
    dest : "uploads/",
    limits : {
        fieldSize:10*1021*1024 // Max 10MB
    }
});

kbRouter.post("/upload",upload.single('file'),async(req,res)=>{
    try{

        const namespace = 'default';

        if(!req.file){
            return res.status(400).json({
                ok:false,
                message:'No file uploaded'
            })
        }

        const {path,mimetype,originalname} = req.file;

        const rawDocs = await loadFileAsDocuments({filePath:path,mimeType:mimetype,originalName:originalname});

        if( !rawDocs ||  !rawDocs.length){
            return res.status(400).json({
                ok:false,
                message:'File not loaded'
            })
        }

        const chunks = await splitDocuments(rawDocs);

        if(!chunks || !chunks.length){
            return res.status(400).json({
                ok:false,
                message:'File uploaded but no chunks created'
            })
        }

        const summary = await ingestDocuments(namespace,chunks);

        return res.status(200).json({
            ok : summary.ok,
            namespace : summary.namespace,
            totalChunks : summary.totalChunks,
            sources : summary.sources
        });

    }
    catch(err){
        res.status(500).json({
            error:'error',
            messsage:'something went wrong while uploading file',
            err:err as any
        })
    }
})